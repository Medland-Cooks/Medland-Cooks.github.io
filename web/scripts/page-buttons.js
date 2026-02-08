namespace("medland-cooks.PageButtons", {}, () => {
  const pageOverUnder = 4;
  const prefix = "fas fa-";
  const left = "chevron-left";
  const right = "chevron-right";
  const enabledButtonClass = "btn btn-primary";
  const disabledButtonClass = "btn btn-secondary";
  const Button = function(props) {
    const buttonClass = props.enabled?enabledButtonClass:disabledButtonClass;
    return <button title={props.title} className={buttonClass} disabled={!props.enabled} onClick={() => props.onClick()}>
      { props.icons.map(icon => <i className={prefix + icon}></i>)}
    </button>;
  }
  return function(props) {
    const args = {
      first: {
        title: "First Page",
        icons: [left, left]
      },
      previous: {
        title: "Previous Page",
        icons: [left]
      },
      next: {
        title: "Next Page",
        icons: [right]
      },
      last: {
        title: "Last Page",
        icons: [right, right]
      }
    }
    if (props.currentPage > 0) {
      args.first.value = 0;
      args.previous.value = props.currentPage - 1;
      args.first.isEnabled = true;
      args.previous.isEnabled = true;
    }
    if (props.currentPage < props.pageCount - 1) {
      args.last.value = props.pageCount - 1;
      args.next.value = props.currentPage + 1;
      args.last.isEnabled = true;
      args.next.isEnabled = true;
    }
    const firstPageNumber = Math.max(0, props.currentPage - pageOverUnder);
    const lastPageNumber = Math.min(props.currentPage + pageOverUnder, props.pageCount - 1);
    const pageButtons = [];
    for (var i = firstPageNumber; i <= lastPageNumber; i++) {
      pageButtons.push(i);
    }
    var onClick = function(value, enabled) {
      if (enabled && ("number" == typeof value)) {
        return () => props.onClick(value);
      } else {
        return () => {};
      }
    }
    return <>
      { ["first", "previous"].map(pageName => {
        const { title, icons, value, isEnabled } = args[pageName];
        return <Button 
          title={title} 
          icons={icons} 
          enabled={isEnabled} 
          onClick={onClick(value, isEnabled)}/>
      })}
      { pageButtons.map(pageNumber => {
        const enabled = (pageNumber != props.currentPage);
        return <Button 
          title={`Page ${pageNumber}`} 
          enabled={enabled} 
          icons={(pageNumber + 1).toString().split("")} 
          onClick={onClick(pageNumber, enabled)}/>
      })}
      { ["next", "last"].map(pageName => {
        const { title, icons, value, isEnabled } = args[pageName];
        return <Button 
          title={title} 
          icons={icons} 
          enabled={isEnabled} 
          onClick={onClick(value, isEnabled)}/>
      })}
    </>;
  }
});