final case class SeisReleasePolicy(
  reducedMotionRequired: Boolean,
  dependencyBudgetLocked: Boolean,
  liveUploadRequiresTarget: Boolean
)

object SeisReleasePolicy {
  val default: SeisReleasePolicy = SeisReleasePolicy(
    reducedMotionRequired = true,
    dependencyBudgetLocked = true,
    liveUploadRequiresTarget = true
  )
}
