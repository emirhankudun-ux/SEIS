#lang racket

(struct native-roadmap-item (lane score language) #:transparent)

(define roadmap
  (list
   (native-roadmap-item "Apple First" 100 "Swift")
   (native-roadmap-item "Data AI" 88 "Python")
   (native-roadmap-item "Systems" 84 "Rust")
   (native-roadmap-item "Android" 76 "Kotlin")
   (native-roadmap-item "Windows" 72 "CSharp")
   (native-roadmap-item "Infrastructure" 70 "Go")))

(define (top-lane)
  (first roadmap))

(provide roadmap top-lane)
