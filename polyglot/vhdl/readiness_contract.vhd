-- SEIS Readiness Contract — VHDL

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity SeisReadinessContract is
    Port (
        prefers_reduced_motion : in  STD_LOGIC;
        requested_motion_mode  : in  STD_LOGIC_VECTOR(1 downto 0);
        release_status         : in  STD_LOGIC_VECTOR(1 downto 0);
        resolved_motion_mode   : out STD_LOGIC_VECTOR(1 downto 0);
        can_deploy             : out STD_LOGIC
    );
end SeisReadinessContract;

-- motion modes: 00=cinematic, 01=balanced, 10=reduced
-- release status: 00=ready, 01=blocked, 10=pending
architecture Behavioral of SeisReadinessContract is
begin
    resolved_motion_mode <=
        "10" when prefers_reduced_motion = '1' else
        requested_motion_mode;

    can_deploy <= '1' when release_status = "00" else '0';
end Behavioral;
