"""
LLM-powered tag extraction service using Ollama for intelligent tag generation.
Provides fallback to regex-based extraction when LLM is unavailable.
"""

import json
import requests
import re
import logging
from typing import List, Optional, Dict, Any
from functools import lru_cache

logger = logging.getLogger(__name__)

class LLMTaggerService:
    """Service for intelligent tag extraction using local LLM (Ollama) with fallbacks."""
    
    def __init__(self, ollama_url: str = None, model: str = "phi3:mini"):
        # Auto-detect if running in Docker and use appropriate URL
        if ollama_url is None:
            # Try to detect if we're in Docker by checking for common Docker environment indicators
            import os
            in_docker = (
                os.path.exists('/.dockerenv') or 
                os.getenv('DOCKER_CONTAINER') or
                os.getenv('CONTAINER') or
                'docker' in os.getenv('HOSTNAME', '').lower()
            )
            
            if in_docker:
                # Running in Docker - use host.docker.internal to reach host machine
                self.ollama_url = "http://host.docker.internal:11434"
                logger.info("Detected Docker environment, using host.docker.internal:11434 for Ollama")
            else:
                # Running locally - use localhost
                self.ollama_url = "http://localhost:11434"
                logger.info("Detected local environment, using localhost:11434 for Ollama")
        else:
            self.ollama_url = ollama_url
        
        self.model = model
        self.timeout = 10  # seconds
        
        # Defense, national security, and emergency coordination focused keywords
        self.emergency_keywords = {
            # Critical Infrastructure & Defense
            "drones": ["drone", "uav", "quadcopter", "multirotor", "fpv", "autonomous", "remote control", "rc", "aerial", "surveillance", "reconnaissance", "drooni", "lennokki"],
            "automation": ["automation", "robotics", "robot", "automated", "plc", "scada", "industrial", "manufacturing", "automaatio", "robotiikka", "teollisuus"],
            "electrical": ["electrical", "electrician", "power", "grid", "generator", "solar", "battery", "inverter", "electrical work", "power systems", "sähkö", "sähkömies", "voima"],
            "mechanical": ["mechanical", "mechanic", "engine", "motor", "hydraulic", "pneumatic", "machinery", "repair", "maintenance", "mekaaninen", "mekaanikko", "kone"],
            "cybersecurity": ["cybersecurity", "cyber", "security", "network security", "information security", "penetration testing", "firewall", "encryption", "tietoturva", "verkko"],
            "communications": ["communication", "radio", "ham", "amateur", "VHF", "UHF", "satellite", "network", "coordinator", "dispatcher", "operator", "encryption", "viestintä", "radio", "verkko"],
            
            # Traditional Emergency Skills
            "medical": ["doctor", "nurse", "paramedic", "medical", "health", "first aid", "emergency", "ambulance", "hospital", "surgery", "physician", "therapist", "pharmacist", "dentist", "veterinary", "lääkäri", "sairaanhoitaja", "ensihoitaja", "terveys", "ensiapu"],
            "technical": ["engineer", "technical", "IT", "computer", "software", "hardware", "network", "system", "programming", "coding", "developer", "technician", "electronics", "insinööri", "tekninen", "tietokone", "ohjelmointi"],
            "logistics": ["logistics", "supply", "transport", "shipping", "warehouse", "inventory", "coordination", "planning", "operations", "management", "logistiikka", "kuljetus", "varasto", "koordinointi"],
            "construction": ["construction", "building", "carpenter", "welder", "plumber", "contractor", "builder", "infrastructure", "bridge", "road", "rakentaminen", "rakennus", "putkimies", "rakennusmies"],
            "transport": ["driver", "pilot", "captain", "vehicle", "truck", "van", "motorcycle", "boat", "aircraft", "helicopter", "kuljettaja", "pilotti", "kapteeni", "ajoneuvo", "trukki"],
            
            # Leadership & Experience
            "leadership": ["manager", "supervisor", "team lead", "coordinator", "director", "chief", "captain", "commander", "leader", "esimies", "päällikkö", "johtaja", "komentaja"],
            "senior": ["senior", "experienced", "expert", "veteran", "advanced", "professional", "kokenut", "asiantuntija", "ammattilainen"],
            "certified": ["certified", "licensed", "qualified", "trained", "certificate", "license", "diploma", "certification", "sertifioitu", "lisensoitu", "pätevä", "koulutettu"],
            
            # Emergency & Crisis Response
            "emergency": ["emergency", "crisis", "disaster", "rescue", "fire", "police", "security", "hazmat", "decontamination", "search and rescue", "hätä", "kriisi", "katastrofi", "pelastus", "palo", "poliisi"],
            "defense": ["defense", "military", "army", "navy", "air force", "veteran", "combat", "tactical", "strategic", "puolustus", "sotilas", "armeija"],
            "surveillance": ["surveillance", "monitoring", "observation", "intelligence", "reconnaissance", "tracking", "detection", "tarkkailu", "valvonta", "tiedustelu"]
        }
    
    def is_ollama_available(self) -> bool:
        """Check if Ollama service is available."""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            return response.status_code == 200
        except Exception as e:
            logger.debug(f"Ollama not available: {e}")
            return False
    
    def ensure_model_available(self) -> bool:
        """Ensure the required model is available in Ollama."""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [model.get("name", "") for model in models]
                return any(self.model in name for name in model_names)
            return False
        except Exception as e:
            logger.debug(f"Could not check model availability: {e}")
            return False
    
    def pull_model(self) -> bool:
        """Pull the required model if not available."""
        try:
            logger.info(f"Pulling model {self.model}...")
            response = requests.post(
                f"{self.ollama_url}/api/pull",
                json={"name": self.model},
                timeout=300  # 5 minutes for model download
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to pull model {self.model}: {e}")
            return False
    
    def extract_tags_with_llm(self, free_text: str, context: Dict[str, Any] = None) -> List[str]:
        """Extract meaningful tags using Ollama LLM."""
        
        # Build context for better tag extraction
        context_info = ""
        if context:
            education = context.get("education_level", "")
            skills = context.get("skills", [])
            if education:
                context_info += f"Education: {education}. "
            if skills:
                context_info += f"Skills: {', '.join(skills[:5])}. "
        
        prompt = f"""Extract 3-5 meaningful tags from this civilian profile for defense and emergency coordination.

{context_info}Profile text: "{free_text}"

PRIORITIZE these critical defense and infrastructure skills:
- Drones & UAVs (drone pilot, FPV, autonomous systems, surveillance)
- Automation & Robotics (PLC, SCADA, industrial automation, robotics)
- Electrical & Power Systems (electrical work, power grid, generators, solar)
- Mechanical Engineering (engines, hydraulics, machinery, repair)
- Cybersecurity (network security, encryption, penetration testing)
- Communications (radio, satellite, encryption, coordination)
- Defense & Military (veteran, tactical, strategic, combat experience)
- Surveillance & Intelligence (monitoring, reconnaissance, detection)

ALSO include traditional emergency skills:
- Medical (doctor, nurse, paramedic, first aid)
- Technical (software, hardware, programming, engineering)
- Logistics (supply chain, transport, coordination)
- Construction (welding, building, infrastructure)
- Leadership (management, coordination, command)
- Experience level (senior, expert, certified, veteran)

Return ONLY a JSON array of tags, no explanation.
Example: ["drones", "automation", "electrical", "veteran", "leadership"]

Tags:"""

        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for consistent results
                        "top_p": 0.9,
                        "max_tokens": 150
                    }
                },
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "").strip()
                
                # Extract JSON from response
                json_match = re.search(r'\[.*?\]', response_text, re.DOTALL)
                if json_match:
                    tags = json.loads(json_match.group())
                    # Validate and clean tags
                    validated_tags = self._validate_tags(tags)
                    logger.info(f"LLM extracted tags: {validated_tags}")
                    return validated_tags
                else:
                    logger.warning(f"Could not parse JSON from LLM response: {response_text}")
                    return []
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"LLM tag extraction failed: {e}")
            return []
    
    def _validate_tags(self, tags: List[str]) -> List[str]:
        """Validate and clean extracted tags."""
        if not isinstance(tags, list):
            return []
        
        validated = []
        for tag in tags:
            if isinstance(tag, str):
                # Clean and normalize tag
                clean_tag = tag.strip().lower().replace(" ", "_").replace("-", "_")
                # Remove non-alphanumeric characters except underscores
                clean_tag = re.sub(r'[^a-z0-9_]', '', clean_tag)
                
                # Filter out meaningless tags
                if (len(clean_tag) >= 2 and 
                    len(clean_tag) <= 30 and 
                    not clean_tag.startswith('_') and
                    clean_tag not in ['null', 'none', 'n/a', 'na', 'undefined']):
                    validated.append(clean_tag)
        
        return list(set(validated))[:5]  # Remove duplicates, limit to 5
    
    @lru_cache(maxsize=1000)
    def extract_tags_with_regex(self, free_text: str) -> List[str]:
        """Fallback regex-based tag extraction."""
        if not free_text:
            return []
        
        text_lower = free_text.lower()
        extracted_tags = []
        
        # Check for emergency coordination keywords
        for category, keywords in self.emergency_keywords.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    extracted_tags.append(category)
                    break  # Only add category once
        
        # Check for experience indicators
        experience_patterns = [
            r'\b(\d+)\s*years?\s*(?:of\s*)?experience\b',
            r'\bsenior\b',
            r'\bexpert\b',
            r'\bprofessional\b',
            r'\bveteran\b',
            r'\badvanced\b'
        ]
        
        for pattern in experience_patterns:
            if re.search(pattern, text_lower):
                extracted_tags.append("senior")
                break
        
        # Check for certification indicators
        cert_patterns = [
            r'\bcertified\b',
            r'\blicensed\b',
            r'\bqualified\b',
            r'\btrained\b',
            r'\bdiploma\b',
            r'\bcertificate\b'
        ]
        
        for pattern in cert_patterns:
            if re.search(pattern, text_lower):
                extracted_tags.append("certified")
                break
        
        # Check for availability
        if any(word in text_lower for word in ["immediate", "available", "ready", "on call"]):
            extracted_tags.append("immediate")
        elif any(word in text_lower for word in ["24h", "24 hours", "within 24", "tomorrow"]):
            extracted_tags.append("24h")
        elif any(word in text_lower for word in ["48h", "48 hours", "within 48", "next week"]):
            extracted_tags.append("48h")
        
        return list(set(extracted_tags))  # Remove duplicates
    
    def extract_tags(self, free_text: str, context: Dict[str, Any] = None) -> List[str]:
        """Main method: Extract tags using LLM with regex fallback."""
        if not free_text or len(free_text.strip()) < 10:
            return []
        
        # Try LLM extraction first
        if self.is_ollama_available():
            if not self.ensure_model_available():
                logger.info(f"Model {self.model} not available, attempting to pull...")
                if self.pull_model():
                    logger.info(f"Successfully pulled model {self.model}")
                else:
                    logger.warning(f"Failed to pull model {self.model}, using regex fallback")
                    return self.extract_tags_with_regex(free_text)
            
            llm_tags = self.extract_tags_with_llm(free_text, context)
            if llm_tags:
                return llm_tags
        
        # Fallback to regex
        logger.info("Using regex fallback for tag extraction")
        return self.extract_tags_with_regex(free_text)
