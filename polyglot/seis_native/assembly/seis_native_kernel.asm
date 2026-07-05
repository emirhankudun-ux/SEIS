section .data
    lane_apple_first db "Apple First", 0
    lane_data_ai db "Data AI", 0
    lane_systems db "Systems", 0
    lane_android db "Android", 0
    lane_windows db "Windows", 0
    lane_infrastructure db "Infrastructure", 0

section .text
    global seis_native_top_lane

seis_native_top_lane:
    mov rax, lane_apple_first
    ret
