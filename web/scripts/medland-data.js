namespace("medland-cooks.MedlandData", {
  "gizmo-atheneum.namespaces.Ajax":"Ajax"
}, ({ Ajax }) => {
  const getImageUrl = (fileId) => `./resources/print-recipies/${fileId}.jpg`
  const callAjax = function(subPath, callback) {
    Ajax.get(`https://Medland-Cooks.github.io/${subPath}`,{
      success: (responseText) => {
        callback(responseText);
      },
      failure: (error) => {
        throw error;
      }
    });
  }
  const medlandData = {
    textFiles: {}
  };
  const applyPrintFileIds = function(callback) {
    if (medlandData.ids) {
      callback(medlandData.ids);
    } else {
      callAjax("medland-cooks/resources/print-files.json", (text) => {
        medlandData.ids = JSON.parse(text);
        callback(medlandData.ids);
      })
    }
  }
  const applyPrintOcrText = function(fileId, callback) {
    if (medlandData.textFiles[fileId]) {
      callback(medlandData.textFiles[fileId]);
    } else {
      callAjax(`medland-cooks/resources/print-recipies/${fileId}.txt`,(text) => {
        medlandData.textFiles[fileId] = text.split("\r").join("").split("\n");
        callback(medlandData.textFiles[fileId]);
      });
    }
  }
  return { getImageUrl, applyPrintFileIds, applyPrintOcrText };
});