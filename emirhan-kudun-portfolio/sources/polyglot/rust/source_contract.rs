#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SourceStatus {
    Live,
    Contract,
    NeedsCredentials,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceContract<'a> {
    pub id: &'a str,
    pub plugin_ref: &'a str,
    pub layer: &'a str,
    pub status: SourceStatus,
}

impl<'a> SourceContract<'a> {
    pub fn is_visible(&self) -> bool {
        !self.plugin_ref.is_empty() && !matches!(self.status, SourceStatus::NeedsCredentials)
    }
}
