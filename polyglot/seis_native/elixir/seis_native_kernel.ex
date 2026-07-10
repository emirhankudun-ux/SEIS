defmodule SeisNativeKernel do
  @lanes [
    %{lane: "Apple First", score: 100},
    %{lane: "Data AI", score: 88},
    %{lane: "Systems", score: 84},
    %{lane: "Android", score: 76},
    %{lane: "Windows", score: 72},
    %{lane: "Infrastructure", score: 70}
  ]

  def lanes, do: @lanes

  def top_lane, do: hd(@lanes)
end
