defmodule Seis.CalmReleasePolicy do
  @moduledoc false

  def policy do
    %{
      reduced_motion_required: true,
      dependency_budget_locked: true,
      live_upload_requires_target: true
    }
  end
end
