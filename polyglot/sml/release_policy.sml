(* SEIS Release Policy — Standard ML *)

datatype release_status = Ready | Blocked | Pending

datatype motion_mode = Cinematic | Balanced | Reduced

fun resolve_motion (requested : motion_mode) (prefers_reduced : bool) : motion_mode =
  if prefers_reduced then Reduced else requested

fun can_deploy (status : release_status) : bool =
  case status of
    Ready   => true
  | Blocked => false
  | Pending => false

fun motion_duration (mode : motion_mode) : int =
  case mode of
    Cinematic => 600
  | Balanced  => 300
  | Reduced   => 0

val _ =
  let
    val mode = resolve_motion Cinematic true
    val dur  = motion_duration mode
  in
    print ("Duration: " ^ Int.toString dur ^ "ms\n")
  end
