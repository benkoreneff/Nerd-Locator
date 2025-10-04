"""
Deterministic tagging and scoring service
"""
import yaml
import re
from typing import List, Dict, Any, Tuple
from pathlib import Path

class TaggerService:
    """Service for generating deterministic tags and capability scores"""
    
    def __init__(self, rules_path: str = "rules.yml"):
        self.rules_path = Path(__file__).parent.parent / rules_path
        self.rules = self._load_rules()
    
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
        
        # Combine all tags
        all_tags = matching_categories + resource_tags + industry_tags
        
        # Calculate final score
        base_score = self.rules.get("base_score", 10)
        category_score = sum(category_scores.values())
        final_score = min(
            base_score + education_score + category_score + availability_bonus + resource_score + industry_score,
            self.rules.get("max_score", 100)
        )
        
        return all_tags, round(final_score, 1)
    
    def get_available_tags(self) -> List[str]:
        """Get list of all available tags"""
        return list(self.rules["categories"].keys())
    
    def get_education_levels(self) -> List[str]:
        """Get list of all education levels"""
        return list(self.rules["education_scores"].keys())

# Global instance
tagger = TaggerService()
