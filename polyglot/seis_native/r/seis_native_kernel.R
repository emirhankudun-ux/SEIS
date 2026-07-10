seis_native_roadmap <- data.frame(
  lane = c("Apple First", "Data AI", "Systems", "Android", "Windows", "Infrastructure"),
  score = c(100, 88, 84, 76, 72, 70),
  primary_language = c("Swift", "Python", "Rust", "Kotlin", "CSharp", "Go"),
  stringsAsFactors = FALSE
)

seis_native_top_lane <- function() {
  seis_native_roadmap[which.max(seis_native_roadmap$score), ]
}
