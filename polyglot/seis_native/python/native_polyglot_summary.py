LANGUAGES = [
    "Swift",
    "Python",
    "Rust",
    "Go",
    "Kotlin",
    "Java",
    "CSharp",
    "SQL",
    "Cpp",
    "Ruby",
    "ObjectiveC",
]

LANES = [
    "Apple First",
    "Data AI",
    "Systems",
    "Android",
    "Windows",
    "Infrastructure",
]


def summary() -> str:
    return "SEIS native languages: " + ", ".join(LANGUAGES) + " | lanes: " + ", ".join(LANES)


if __name__ == "__main__":
    print(summary())
