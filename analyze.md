# Analyze OCR Success

Source folder
: "./recipe-photos/print/"

Result folder
: "./medland-cooks/resources/print-recipies/"

The source folder contains a collection of photographs of recipies printed in magazines and / or cookbooks.

The Files in the result folder were the text that was harvested from those images using the clojure app in "medland-cooks", using an OCR plug in.

The filename of each text file matches the filename of the photo from which it was harvested

I want to analyze the text files and rate them (percent / letter grade) for how well the text of each recipe was harvested in terms of legibility:
- measurements / counts / units of ingredients (with particular attention to fractions)
- punctuation for instructions
- spelling overall

Each file should be graded, with those with the highest grade being given recommendations as to what remaining "finessing" may be necessary.

The summary of the analysis should be written out as a sibling to this file.