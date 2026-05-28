from app.ai.providers.aiml import AIMLProvider
from app.ai.providers.gemini import GeminiProvider





REGISTRY = {
    AIMLProvider.name: AIMLProvider(),
    GeminiProvider.name: GeminiProvider(),
}



def get(name: str):
    p = REGISTRY.get(name)
    if p is None:
        raise ValueError(f"Unknown provider: {name}")
    return p



