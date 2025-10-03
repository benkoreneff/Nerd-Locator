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
        availability: str = "immediate"
    ) -> Tuple[List[str], float]:
        """Generate tags and capability score from profile data"""
        
        # Combine all text for keyword matching
        text_to_analyze = " ".join([
            education_level.lower(),
            " ".join(skills).lower(),
            free_text.lower() if free_text else ""
        ])
        
        # Find matching categories
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
        
        # Calculate base score from education
        education_score = self.rules["education_scores"].get(education_level, 0)
        
        # Calculate availability bonus
        availability_bonus = 0
        for category in matching_categories:
            bonus = self.rules["categories"][category]["availability_bonus"].get(availability, 0)
            availability_bonus += bonus
        
        # Calculate final score
        base_score = self.rules.get("base_score", 10)
        category_score = sum(category_scores.values())
        final_score = min(
            base_score + education_score + category_score + availability_bonus,
            self.rules.get("max_score", 100)
        )
        
        return matching_categories, round(final_score, 1)
    
    def get_available_tags(self) -> List[str]:
        """Get list of all available tags"""
        return list(self.rules["categories"].keys())
    
    def get_education_levels(self) -> List[str]:
        """Get list of all education levels"""
        return list(self.rules["education_scores"].keys())

# Global instance
tagger = TaggerService()
