"""
Deterministic tagging and scoring service with LLM enhancement
"""
import yaml
import re
import logging
from typing import List, Dict, Any, Tuple
from pathlib import Path

# Import LLM tagger service
try:
    from .llm_tagger import LLMTaggerService
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logging.warning("LLM tagger service not available")

logger = logging.getLogger(__name__)

class TaggerService:
    """Service for generating deterministic tags and capability scores"""
    
    def __init__(self, rules_path: str = "rules.yml"):
        self.rules_path = Path(__file__).parent.parent / rules_path
        self.rules = self._load_rules()
        
        # Initialize LLM tagger service
        if LLM_AVAILABLE:
            try:
                self.llm_tagger = LLMTaggerService()
                logger.info("LLM tagger service initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize LLM tagger: {e}")
                self.llm_tagger = None
        else:
            self.llm_tagger = None
    
    def _load_rules(self) -> Dict[str, Any]:
        """Load tagging rules from YAML file"""
        try:
            with open(self.rules_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            # Fallback rules if file not found
            return {
                "categories": {
                    "general": {
                        "weight": 1.0,
                        "keywords": {"en": ["volunteer", "help"], "fi": ["vapaaehtoinen", "apu"]},
                        "availability_bonus": {"immediate": 5, "24h": 3, "48h": 2, "unavailable": 0}
                    }
                },
                "education_scores": {"high_school": 5},
                "base_score": 10,
                "max_score": 100
            }
    
    def generate_tags_and_score(
        self,
        education_level: str,
        skills: List[str],
        free_text: str = "",
        availability: str = "immediate",
        resources: List[Dict[str, Any]] = None,
        industry: str = None
    ) -> Tuple[List[str], float]:
        """Generate tags and capability score from profile data"""
        
        # Combine all text for keyword matching
        text_to_analyze = " ".join([
            education_level.lower(),
            " ".join(skills).lower(),
            free_text.lower() if free_text else ""
        ])
        
        # Find matching categories from skills and text
        matching_categories = []
        category_scores = {}
        
        for category, config in self.rules["categories"].items():
            score = 0
            matches = 0
            
            # Check English keywords
            for keyword in config["keywords"].get("en", []):
                if keyword.lower() in text_to_analyze:
                    score += config["weight"] * 10
                    matches += 1
            
            # Check Finnish keywords
            for keyword in config["keywords"].get("fi", []):
                if keyword.lower() in text_to_analyze:
                    score += config["weight"] * 10
                    matches += 1
            
            # Only include categories with matches
            if matches > 0:
                matching_categories.append(category)
                category_scores[category] = score
        
        # Add resource-based tags and scores
        resource_tags = []
        resource_score = 0
        if resources:
            resource_config = self.rules.get("resources", {})
            for resource in resources:
                category = resource.get("category")
                subtype = resource.get("subtype")
                quantity = resource.get("quantity", 1)
                
                if category in resource_config and subtype in resource_config[category]["items"]:
                    # Add resource tag
                    resource_tag = f"{category}.{subtype}"
                    if resource_tag not in resource_tags:
                        resource_tags.append(resource_tag)
                    
                    # Calculate score contribution
                    base_weight = resource_config[category]["items"][subtype]
                    category_weight = resource_config[category]["weight"]
                    item_score = base_weight * category_weight * quantity
                    
                    # Bonus for high-value specs
                    specs = resource.get("specs", {})
                    if specs:
                        # Add small bonus based on specs (e.g., high kW generators, large build volumes)
                        for spec_key, spec_value in specs.items():
                            if isinstance(spec_value, (int, float)) and spec_value > 0:
                                item_score += min(spec_value * 0.1, 2)  # Max +2 bonus per spec
                    
                    resource_score += item_score
        
        # Add industry-based tag and score
        industry_tags = []
        industry_score = 0
        if industry:
            industry_config = self.rules.get("industries", {})
            if industry in industry_config:
                # Add industry tag
                industry_tag = f"industry.{industry}"
                industry_tags.append(industry_tag)
                
                # Calculate industry score contribution
                industry_score = industry_config[industry]
        
        # Calculate base score from education
        education_score = self.rules["education_scores"].get(education_level, 0)
        
        # Calculate availability bonus
        availability_bonus = 0
        for category in matching_categories:
            bonus = self.rules["categories"][category]["availability_bonus"].get(availability, 0)
            availability_bonus += bonus
        
        # Extract LLM tags from free_text (if available and substantial)
        llm_tags = []
        if self.llm_tagger and free_text and len(free_text.strip()) > 10:
            try:
                # Build context for LLM
                context = {
                    "education_level": education_level,
                    "skills": skills,
                    "availability": availability,
                    "industry": industry
                }
                llm_tags = self.llm_tagger.extract_tags(free_text, context)
                logger.info(f"LLM extracted {len(llm_tags)} tags: {llm_tags}")
            except Exception as e:
                logger.warning(f"LLM tag extraction failed: {e}")
        
        # Combine all tags (rule-based + resource + industry + LLM)
        all_tags = matching_categories + resource_tags + industry_tags + llm_tags
        
        # Remove duplicates while preserving order
        unique_tags = []
        seen = set()
        for tag in all_tags:
            if tag not in seen:
                unique_tags.append(tag)
                seen.add(tag)
        
        # Calculate final score
        base_score = self.rules.get("base_score", 10)
        category_score = sum(category_scores.values())
        
        # Add small bonus for LLM-extracted tags (they indicate richer profile)
        llm_bonus = len(llm_tags) * 2 if llm_tags else 0
        
        final_score = min(
            base_score + education_score + category_score + availability_bonus + resource_score + industry_score + llm_bonus,
            self.rules.get("max_score", 100)
        )
        
        return unique_tags, round(final_score, 1)
    
    def calculate_query_relevant_score(
        self,
        civilian_data: Dict[str, Any],
        search_query: str = "",
        skills_query: List[str] = None,
        include_tags: List[str] = None
    ) -> float:
        """
        Calculate capability score based on relevance to search query
        instead of static profile scoring.
        """
        if skills_query is None:
            skills_query = []
        if include_tags is None:
            include_tags = []
        
        # Extract civilian data
        education_level = civilian_data.get("education_level", "")
        skills = civilian_data.get("skills", [])
        free_text = civilian_data.get("free_text", "")
        availability = civilian_data.get("availability", "immediate")
        industry = civilian_data.get("industry", "")
        existing_tags = civilian_data.get("tags", [])
        
        # Combine search terms for matching
        search_terms = []
        if search_query:
            search_terms.extend(search_query.lower().split())
        if skills_query:
            search_terms.extend([skill.lower() for skill in skills_query])
        if include_tags:
            search_terms.extend([tag.lower() for tag in include_tags])
        
        if not search_terms:
            # No search terms, return base score
            return self.rules.get("base_score", 10)
        
        # Calculate query relevance score
        query_relevance_score = 0
        match_count = 0
        
        # Match against category keywords
        for category, config in self.rules["categories"].items():
            category_matches = 0
            
            # Check if search terms match category keywords
            for search_term in search_terms:
                for keyword in config["keywords"].get("en", []):
                    if search_term in keyword.lower() or keyword.lower() in search_term:
                        category_matches += 1
                        query_relevance_score += config["weight"] * 15  # Higher weight for query relevance
                        break
                
                for keyword in config["keywords"].get("fi", []):
                    if search_term in keyword.lower() or keyword.lower() in search_term:
                        category_matches += 1
                        query_relevance_score += config["weight"] * 15
                        break
            
            # Check if civilian has this category in their existing tags
            if category in existing_tags and category_matches > 0:
                query_relevance_score += config["weight"] * 10  # Bonus for having the matched category
                match_count += 1
        
        # Match against civilian's skills and free text
        civilian_text = " ".join([
            education_level.lower(),
            " ".join(skills).lower(),
            free_text.lower() if free_text else ""
        ])
        
        for search_term in search_terms:
            if search_term in civilian_text:
                query_relevance_score += 5  # Direct text match bonus
                match_count += 1
        
        # Match against existing tags
        for search_term in search_terms:
            for tag in existing_tags:
                if search_term in tag.lower() or tag.lower() in search_term:
                    query_relevance_score += 8  # Tag match bonus
                    match_count += 1
        
        # Add education score (same as before)
        education_score = self.rules["education_scores"].get(education_level, 0)
        
        # Add availability bonus (same as before)
        availability_bonus = 0
        if availability in ["immediate", "24h", "48h"]:
            # Use general category availability bonus if no specific matches
            general_config = self.rules["categories"].get("general", {})
            availability_bonus = general_config.get("availability_bonus", {}).get(availability, 0)
        
        # Add industry score (same as before)
        industry_score = 0
        if industry:
            industry_config = self.rules.get("industries", {})
            industry_score = industry_config.get(industry, 0)
        
        # Calculate final score
        base_score = self.rules.get("base_score", 10)
        
        # If no matches found, return very low score
        if match_count == 0:
            return min(base_score + education_score + availability_bonus + industry_score, 100)
        
        final_score = min(
            base_score + query_relevance_score + education_score + availability_bonus + industry_score,
            self.rules.get("max_score", 100)
        )
        
        return round(final_score, 1)
    
    def get_available_tags(self) -> List[str]:
        """Get list of all available tags"""
        return list(self.rules["categories"].keys())
    
    def get_education_levels(self) -> List[str]:
        """Get list of all education levels"""
        return list(self.rules["education_scores"].keys())

# Global instance
tagger = TaggerService()
