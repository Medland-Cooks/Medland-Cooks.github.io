namespace("medland-cooks.MedlandCooks", {
  "medland-cooks.MedlandData": "MedlandData",
  "medland-cooks.PageButtons": "PageButtons"
}, ({ MedlandData, PageButtons }) => {
  const idPageSize = 25;
  const pages = {
    "Print Recipies": "print"
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        idPage: 0
      };
    }
    selectPage(page) {
      switch(page) {
        case "print":
          MedlandData.applyPrintFileIds((fileIds) => {
            const ids = Array.from(fileIds);
            const printFileIds = [];
            while(ids.length > 0) {
              printFileIds.push(ids.splice(0,idPageSize));
            }
            this.setState({ page, printFileIds, fileLines: undefined })
          });
          break;
        default:
          if (Object.values(pages).indexOf(page) >= 0) {
            this.setState({ page, printFileIds: undefined, fileLines: undefined });
          } else {
            MedlandData.applyPrintOcrText(page, (fileLines) => {
              this.setState({ page, fileLines })
            });
          }
      }
    }
    getPage(page) {
      if (this.state.fileLines) {
        const imageUrl = MedlandData.getImageUrl(this.state.page);
        return <div className="row justify-content-center h-100">
          <div className="col-5 d-flex flex-column mh-50 mw-50">
            <h2 className="text-center">{this.state.page}</h2>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.selectPage("print");
            }}>
              <img className="text-center mh-100 mw-100" src={imageUrl}/>
            </a>
          </div>
          <div className="col-1"></div>
          <div className="col-5 H-100 overflow-y-scroll">
            { this.state.fileLines.map(line => <p>{line}</p>)}
          </div>
        </div>;
      } else if (this.state.printFileIds) {
        return <div className="d-flex flex-column justify-content-center h-100">
          <div className="d-flex justify-content-center">
            <PageButtons 
              currentPage={this.state.idPage} 
              pageCount={this.state.printFileIds.length} 
              onClick={(idPage) => this.setState({ idPage })}>
            </PageButtons>
          </div>
          <div className="d-flex justify-content-center flex-wrap w-100 h-100 overflow-y-scroll">
            { this.state.printFileIds[this.state.idPage].map(id => {
              const imageUrl = MedlandData.getImageUrl(id);
              return <button className="btn btn-primary m-3 p-2 justify-content-center align-items-center" onClick={(e) => {
                e.preventDefault();
                this.selectPage(id);
              }}>
                <div className="d-flex flex-column">
                  <h5 className="text-center">{id}</h5>
                  <div>
                    <img className="thumbnail text-center" src={imageUrl}/>
                  </div>
                </div>
              </button>;
            })}
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
      return <div className="d-flex justify-content-center h-75">
        <div className="d-flex flex-column h-100">
          <h1 className="text-center">Medland Cooks!</h1>
          { this.getPage(this.state.page) }
        </div>
      </div>;
    }
  }
});