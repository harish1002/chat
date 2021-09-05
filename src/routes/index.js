import * as React from "react";
import { Route, BrowserRouter as Router, Switch, } from "react-router-dom";
import MyComponent from "../screens/MyComponent";

export default ()=>{
    const pathname = window.location.pathname;
    const paths = pathname.split("/");
    return (
        <Router>
            <Switch>
                <Route path="/" component={MyComponent} />
            </Switch>
        </Router>
    )

}