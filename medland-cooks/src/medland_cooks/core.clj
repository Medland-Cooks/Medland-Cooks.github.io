(ns medland-cooks.core
  (:require
   [clojure.java.io :as io]
   [clojure.pprint :as pp]
   [clojure.set :as set]
   [clojure.string :as str]
   [medland-cooks.ocr :as ocr]
   [cheshire.core :as json]))

(def ^{:private true} source-folder "recipe photos/print/")

(def ^{:private true} dest-folder "resources/print-recipies/")

(defn get-text-from-print-image [file-id extension]
  (spit 
   (str "resources/print-recipies/" file-id ".txt")
   (ocr/do-ocr (str "recipe photos/print/" file-id "." extension) "eng")))

(defn transcribe-all-print-images []
  (let [folder (io/file source-folder)]
    (doseq [file (.listFiles folder)]
      (let [[filename extension] (str/split (.getName file) #"\.")]
        (println filename)
        (get-text-from-print-image filename extension)))))

(defn get-file-list []
  (let [src (map #(first (str/split (.getName %) #"\.")) (.listFiles (io/file source-folder)))]
    (spit "resources/print-files.json" (json/generate-string src))))
