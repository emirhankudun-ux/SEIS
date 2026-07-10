#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct NativeRoadmapItem {
    std::string lane;
    int score;
    std::string language;
};

std::vector<NativeRoadmapItem> roadmap() {
    return {
        {"Apple First", 100, "Swift"},
        {"Data AI", 88, "Python"},
        {"Systems", 84, "Rust"},
        {"Android", 76, "Kotlin"},
        {"Windows", 72, "CSharp"},
        {"Infrastructure", 70, "Go"}
    };
}

NativeRoadmapItem top_lane() {
    auto items = roadmap();
    return *std::max_element(items.begin(), items.end(), [](const auto& left, const auto& right) {
        return left.score < right.score;
    });
}

int main() {
    const auto top = top_lane();
    std::cout << top.lane << " " << top.score << " " << top.language << "\n";
    return 0;
}
