(ns medland-cooks.ocr
  (:import [net.sourceforge.tess4j Tesseract ITesseract]
           [java.io File]
           [javax.imageio ImageIO]))

(defn do-ocr [image-file-path language-code]
  (let [instance (Tesseract.) ; Create a Tesseract instance
        img-file (File. image-file-path)
        buffered-image (ImageIO/read img-file)]

    ; Set the tessdata path (Tess4J looks for a 'tessdata' folder by default)
    ; (if you placed the folder elsewhere, set it with this):
    ; (.setDatapath instance "/full/path/to/your/tessdata") 
    
    (.setLanguage instance language-code) ; Set the language (e.g., "eng")
    
    ; Perform the OCR
    (.doOCR instance buffered-image)))

;; Example usage:
(comment
  (println (do-ocr "path/to/your/image.png" "eng")))