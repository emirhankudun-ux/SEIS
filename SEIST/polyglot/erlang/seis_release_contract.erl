-module(seis_release_contract).
-export([package/0, locales/0, live_upload_status/1]).

package() ->
  "dist/seis-static.zip".

locales() ->
  ["tr", "en", "fr", "it", "de", "es", "ar"].

live_upload_status(undefined) ->
  blocked_until_target_confirmed;
live_upload_status("") ->
  blocked_until_target_confirmed;
live_upload_status(_) ->
  ready_for_configured_target.
