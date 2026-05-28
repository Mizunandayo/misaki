from __future__ import annotations
from enum import Enum




class Capability(str, Enum):
    FAST_CHEAP = "FAST_CHEAP"
    DEEP_REASONING = "DEEP_REASONING"
    LONG_CONTEXT = "LONG_CONTEXT"
    LONG_FORM_PROSE = "LONG_FORM_PROSE"
    VISION = "VISION"



