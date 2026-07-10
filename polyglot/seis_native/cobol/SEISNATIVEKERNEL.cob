       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEISNATIVEKERNEL.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 SEIS-LANES.
          05 LANE-APPLE-FIRST        PIC X(20) VALUE "Apple First".
          05 LANE-DATA-AI            PIC X(20) VALUE "Data AI".
          05 LANE-SYSTEMS            PIC X(20) VALUE "Systems".
          05 LANE-ANDROID            PIC X(20) VALUE "Android".
          05 LANE-WINDOWS            PIC X(20) VALUE "Windows".
          05 LANE-INFRASTRUCTURE     PIC X(20) VALUE "Infrastructure".

       PROCEDURE DIVISION.
           DISPLAY LANE-APPLE-FIRST
           STOP RUN.
