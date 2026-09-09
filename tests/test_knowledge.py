import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.knowledge import AgriculturalKnowledgeEngine, QueryIntentClassifier

def run_tests():
    queries = [
        "My paddy leaves are yellow.",
        "My soil is very dry.",
        "What is blast disease?",
        "I sprayed yesterday.",
        "My plant has insects.",
        "నా పంటకు నీరు ఎప్పుడు పెట్టాలి?",
        "నా వరి ఆకులు ఎందుకు పసుపుగా మారుతున్నాయి?",
        "బ్లాస్ట్ అంటే ఏమిటి?",
        "నేను నిన్న మందు పిచికారీ చేశాను."
    ]

    replies = []
    print("=== TESTING NO REPEATED RESPONSES ===")
    for q in queries:
        ans = AgriculturalKnowledgeEngine.answer_query(q, crop="paddy", language="te")
        intent = ans["intent"]
        reply_preview = ans["reply"][:50].replace("\n", " ")
        print(f"Query: {q}")
        print(f"  -> Intent: {intent}")
        print(f"  -> Reply Preview: {reply_preview}...\n")
        replies.append(ans["reply"])

    unique_replies = set(replies)
    print(f"Total Queries: {len(queries)} | Unique Responses: {len(unique_replies)}")
    assert len(unique_replies) >= 6, f"Expected at least 6 distinct agronomic answers, got {len(unique_replies)}"
    print("TEST PASSED: Real distinct agronomic answers verified!\n")

if __name__ == "__main__":
    run_tests()
