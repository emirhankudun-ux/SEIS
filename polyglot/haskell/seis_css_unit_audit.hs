-- SEIS CSS unit auditor — Haskell single-file program.
--
-- Reads apps/web/style.css and checks that font-size declarations use
-- relative units (rem, em, clamp) rather than absolute px, except for
-- the root/body/html base declaration where a px value is the norm.
-- Also prints a histogram of every dimension unit used in the file.
--
-- Usage:  runghc polyglot/haskell/seis_css_unit_audit.hs [--self-test] [css-file]
-- Exit:   0 PASS, 1 FAIL

module Main where

import Data.Char        (toLower, isSpace, isDigit)
import Data.List        (isPrefixOf, isInfixOf, sortBy, intercalate)
import Data.Ord         (Down(..))
import System.Environment (getArgs)
import System.Exit      (exitWith, ExitCode(..))
import System.IO        (hPutStrLn, stderr, hSetEncoding, utf8, openFile, IOMode(..), hGetContents)

defaultCss :: FilePath
defaultCss = "apps/web/style.css"

-- ─── string helpers ──────────────────────────────────────────────────────────

trim :: String -> String
trim = f . f
  where f = reverse . dropWhile isSpace

lc :: String -> String
lc = map toLower

splitOn :: Char -> String -> [String]
splitOn _ ""     = [""]
splitOn c (x:xs)
    | x == c    = "" : splitOn c xs
    | otherwise = let (h:t) = splitOn c xs in (x:h) : t

-- Count non-overlapping occurrences of needle in haystack
countSubstr :: String -> String -> Int
countSubstr _      []  = 0
countSubstr needle hay@(_:rest)
    | needle `isPrefixOf` hay = 1 + countSubstr needle (drop (length needle) hay)
    | otherwise               = countSubstr needle rest

-- Count CSS dimension unit occurrences (unit must be preceded by digit or '.')
countDimUnit :: String -> String -> Int
countDimUnit unit css = go ' ' css
  where
    go _    []  = 0
    go prev hay@(c:rest)
        | unit `isPrefixOf` hay && (isDigit prev || prev == '.') =
            1 + go (last unit) (drop (length unit) hay)
        | otherwise = go c rest

-- ─── CSS helpers ─────────────────────────────────────────────────────────────

-- Selector names that are allowed to use px for their base font-size
rootSelectors :: [String]
rootSelectors = ["body", "html", ":root"]

isRootSelector :: String -> Bool
isRootSelector ctx = any (`isInfixOf` lc ctx) rootSelectors

-- Strip selector prefix before '{' so we can inspect just the declaration
normaliseDecl :: String -> String
normaliseDecl d =
    case break (== '{') d of
        (_, '{':rest) -> trim rest
        _             -> trim d

-- True when the declaration is a font-size with a px value
isFontSizePx :: String -> Bool
isFontSizePx decl =
    let nd    = normaliseDecl decl
        lower = lc nd
    in "font-size" `isPrefixOf` lower && "px" `isInfixOf` nd

-- True when any semicolon-delimited part of a line is a px font-size
lineHasFontSizePx :: String -> Bool
lineHasFontSizePx = any isFontSizePx . splitOn ';'

-- ─── audit ───────────────────────────────────────────────────────────────────

data Finding = Finding
    { fLine :: Int
    , fText :: String
    , fCtx  :: String
    } deriving (Show)

-- Scan lines, tracking the most recent selector context (innermost '{' line).
-- Returns findings where font-size: <n>px appears in a non-root selector.
fontSizePxAudit :: [String] -> [Finding]
fontSizePxAudit ls = go ls 1 "" []
  where
    go []     _    _   acc = reverse acc
    go (l:rest) ln ctx acc =
        let inComment = "/*" `isInfixOf` l
            newCtx
                | inComment       = ctx
                | '{' `elem` l    = trim (takeWhile (/= '{') l)
                | '}' `elem` l    = ""
                | otherwise       = ctx
            finding
                | inComment                  = Nothing
                | not (lineHasFontSizePx l)  = Nothing
                | isRootSelector newCtx      = Nothing
                | otherwise = Just Finding
                    { fLine = ln
                    , fText = trim l
                    , fCtx  = if null newCtx then "(unknown)" else newCtx
                    }
            newAcc = maybe acc (: acc) finding
        in go rest (ln + 1) newCtx newAcc

-- Build a sorted frequency table of CSS dimension units in the source
-- Uses digit-preceded counting to avoid false matches like "em" in "system"
unitHistogram :: String -> [(String, Int)]
unitHistogram css =
    let units  = ["rem", "vmin", "vmax", "dvw", "dvh", "vw", "vh", "em", "px", "%", "fr", "ch"]
        counts = [(u, countDimUnit u css) | u <- units, countDimUnit u css > 0]
    in sortBy (\(_, a) (_, b) -> compare (Down a) (Down b)) counts

-- ─── self-tests ──────────────────────────────────────────────────────────────

selfTest :: IO Bool
selfTest = do
    let ts = tests
        failures = filter (not . fst) ts
    mapM_ (\(_, lbl) -> putStrLn $ "  [FAIL] self-test: " ++ lbl) failures
    let p = length (filter fst ts)
        t = length ts
    putStrLn $ (if p == t then "[PASS]" else "[FAIL]") ++
               " css-unit-audit  " ++ show p ++ "/" ++ show t ++
               " self-tests passed"
    return (p == t)

tests :: [(Bool, String)]
tests =
    [ ( countSubstr "px"  "16px 24px" == 2
      , "countSubstr counts 2 px occurrences" )

    , ( countSubstr "rem" "1.5rem 2rem" == 2
      , "countSubstr counts 2 rem occurrences" )

    , ( countSubstr "px" "no-units" == 0
      , "countSubstr returns 0 when absent" )

    , ( not (isFontSizePx "font-size: 0.875rem")
      , "isFontSizePx is False for rem" )

    , ( isFontSizePx "font-size: 14px"
      , "isFontSizePx is True for px" )

    , ( null (fontSizePxAudit ["body {", "  font-size: 16px;", "}"])
      , "body px font-size is permitted" )

    , ( null (fontSizePxAudit ["html { font-size: 16px; }"])
      , "html px font-size is permitted (inline)" )

    , ( not . null $ fontSizePxAudit [".btn {", "  font-size: 14px;", "}"]
      , "non-root px font-size is flagged" )

    , ( null (fontSizePxAudit [".heading {", "  font-size: 1.5rem;", "}"])
      , "rem font-size is clean" )

    , ( let hist = unitHistogram "font-size: 1rem; margin: 16px; padding: 8px;"
        in lookup "rem" hist == Just 1 && lookup "px" hist == Just 2
      , "unitHistogram counts digit-preceded units correctly" )

    , ( countDimUnit "em" "system 1.5em item" == 1
      , "countDimUnit skips em in non-dimension words" )
    ]

-- ─── main ────────────────────────────────────────────────────────────────────

main :: IO ()
main = do
    args <- getArgs
    case args of
        ["--self-test"] -> do
            ok <- selfTest
            exitWith (if ok then ExitSuccess else ExitFailure 1)
        [f]  -> runAudit f
        []   -> runAudit defaultCss
        _    -> hPutStrLn stderr usage >> exitWith (ExitFailure 1)
  where
    usage = "Usage: runghc seis_css_unit_audit.hs [--self-test] [css-file]"

readFileUtf8 :: FilePath -> IO String
readFileUtf8 path = do
    h <- openFile path ReadMode
    hSetEncoding h utf8
    hGetContents h

runAudit :: FilePath -> IO ()
runAudit path = do
    css <- readFileUtf8 path
    let ls       = lines css
        findings = fontSizePxAudit ls
        hist     = unitHistogram css

    putStrLn $ "       " ++ path ++ ": " ++ show (length ls) ++ " lines"
    putStrLn $ "       unit histogram: " ++
               intercalate "  " [u ++ "×" ++ show n | (u, n) <- hist]

    if null findings
        then putStrLn "[PASS] css-unit-audit  all font-size values use relative units"
        else do
            putStrLn $ "[FAIL] css-unit-audit  " ++ show (length findings) ++
                       " font-size(s) use px in non-root context:"
            mapM_ (\f -> putStrLn $ "       line " ++ show (fLine f) ++
                                    " [" ++ fCtx f ++ "]: " ++ fText f)
                  findings
            exitWith (ExitFailure 1)
