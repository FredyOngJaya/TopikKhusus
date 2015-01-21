var Tooltip = React.createClass({
	render : function() {
		var show = this.props.show;
		return (
			<div className={show}><h2>Tooltip!</h2></div>
		);
	}
});

var Hover = React.createClass({
	over : function (){
		this.props.buttonHover("visible");
	},
	render : function() {
		return (
			<button onMouseEnter={this.over}>Hover!</button>
		);
	}
});

var Complete = React.createClass({
	getInitialState : function() {
		return {show: "hiddenDiv"};
	},
	handleHover : function(hover) {
		this.setState({show: hover});
	},
	render : function() {
		var tooltipCSS = this.state.show;
		return (
			<div>
				<Tooltip show={tooltipCSS}/>
				<Hover buttonHover={this.handleHover}/>
			</div>
		);
	}
});

React.render(
	<Complete />,
	document.getElementById("content")
);