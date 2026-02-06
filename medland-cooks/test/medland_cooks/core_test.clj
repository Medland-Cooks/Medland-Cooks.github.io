(ns medland-cooks.core-test
  (:require [clojure.test :refer :all]
            [medland-cooks.core :as core]))

(deftest test-unparsables
  (core/get-file-list))
