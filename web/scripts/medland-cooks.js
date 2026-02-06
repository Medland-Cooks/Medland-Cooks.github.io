namespace("medland-cooks.MedlandCooks", {
  "medland-cooks.MedlandData": "MedlandData"
}, ({ MedlandData }) => {
  const pages = {
    "Print Recipies": "print"
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    selectPage(page) {
      switch(page) {
        case "print":
          MedlandData.applyPrintFileIds((printFileIds) => this.setState({ page, printFileIds, fileLines: undefined }));
          break;
        default:
          if (Object.values(pages).indexOf(page) >= 0) {
            this.setState({ page, printFileIds: undefined, fileLines: undefined });
          } else {
            MedlandData.applyPrintOcrText(page, (fileLines) => {
              this.setState({ page, printFileIds: undefined, fileLines })
            });
          }
      }
    }
    getPage(page) {
      if (this.state.printFileIds) {
        return <div className="row justify-content-center w-75">
          { this.state.printFileIds.map(id => {
            const imageUrl = MedlandData.getImageUrl(id);
            return <div className="col-2">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                this.selectPage(id);
              }}><img src={imageUrl}/></a>
            </div>
          })}
        </div>;
      } else if (this.state.fileLines) {
        const imageUrl = MedlandData.getImageUrl(this.state.page);
        return <div className="row justify-content-center">
          <div className="col-5">
            <img src={imageUrl}/>
          </div>
          <div className="col-1"></div>
          <div className="col-5">
            { this.state.fileLines.map(line => <p>{line}</p>)}
          </div>
        </div>;
      } else {
        switch(page) {
          default:
            const pageLabels = Object.entries(pages);
            return <div className="d-flex justify-content-center">
              <div className="d-flex flex-column justify-content-center h-100">
                { pageLabels.map(([label,page]) => <button className="btn btn-primary m-3 p-2" onClick={() => this.selectPage(page)}>{label}</button>) }
              </div>
            </div>;
        }
      }
    }
    render() {
      return <div className="d-flex justify-content-center h-100">
        <div className="d-flex flex-column justify-content-center h-100">
          <h1 className="text-center">Medland Cooks!</h1>
          { this.getPage(this.state.page) }
        </div>
      </div>;
    }
  }
});