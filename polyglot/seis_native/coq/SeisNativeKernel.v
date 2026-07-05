From Coq Require Import Strings.String.

Open Scope string_scope.

Record NativeRoadmapItem := {
  lane : string;
  score : nat;
  language : string
}.

Definition apple_first : string := "Apple First".
Definition data_ai : string := "Data AI".
Definition systems : string := "Systems".
Definition android : string := "Android".
Definition windows : string := "Windows".
Definition infrastructure : string := "Infrastructure".
