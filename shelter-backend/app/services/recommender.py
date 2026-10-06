"""
Rule-based shelter design recommendation mapping, copied verbatim from the
backend guide (section 14). No ML is involved here - this only translates a
predicted thermal_condition into a fixed design recommendation.
"""

DESIGN_RECOMMENDATIONS: dict[str, dict[str, str]] = {
    "Hot-Dry": {
        "roof": "High thermal-mass roof, light colour",
        "walls": "Thick mud/brick walls for heat storage",
        "ventilation": "Small day openings, night flushing",
        "shading": "Deep overhangs, courtyard shade",
        "priority": "Block daytime heat, release at night",
    },
    "Hot-Humid": {
        "roof": "Lightweight reflective roof",
        "walls": "Thin, permeable walls",
        "ventilation": "Maximise cross-ventilation, raised floor",
        "shading": "Wide overhangs against sun and rain",
        "priority": "Keep air moving to fight humidity",
    },
    "Cold": {
        "roof": "Insulated, steep to shed snow",
        "walls": "Heavy insulation, compact form",
        "ventilation": "Minimal, controlled air changes",
        "shading": "None; maximise south-facing glazing",
        "priority": "Trap heat, cut heat loss",
    },
    "High-Solar": {
        "roof": "Reflective roof, optional solar panels",
        "walls": "Insulated to resist radiant gain",
        "ventilation": "Moderate, shaded intakes",
        "shading": "Deep shading devices, low window area",
        "priority": "Reject intense solar radiation",
    },
    "Windy": {
        "roof": "Low-pitch, firmly anchored roof",
        "walls": "Wind-braced, sheltered openings",
        "ventilation": "Controlled, on the leeward side",
        "shading": "Windbreaks and screens",
        "priority": "Resist wind load, avoid draughts",
    },
    "Moderate": {
        "roof": "Standard insulated roof",
        "walls": "Conventional cavity walls",
        "ventilation": "Natural ventilation, operable windows",
        "shading": "Modest overhangs",
        "priority": "Comfort with minimal intervention",
    },
}


def get_design_for_condition(thermal_condition: str) -> dict:
    design = DESIGN_RECOMMENDATIONS.get(thermal_condition)
    if design is None:
        # Should never happen since thermal_condition always comes from the
        # model's fixed label set, but fail safe rather than KeyError.
        design = DESIGN_RECOMMENDATIONS["Moderate"]
    return design
