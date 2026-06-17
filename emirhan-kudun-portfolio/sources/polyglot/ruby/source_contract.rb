module Seis
  module Portfolio
    SourceContract = Struct.new(:id, :plugin_ref, :layer, :visible_in_portfolio, keyword_init: true) do
      def valid_plugin_ref?
        plugin_ref.start_with?("plugin://")
      end
    end
  end
end
