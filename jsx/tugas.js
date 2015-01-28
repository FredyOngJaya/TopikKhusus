var main_container = document.querySelector("div#container");

var CategorySearch = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();
		var keyword = this.refs.keyword.getDOMNode().value.trim();
		if (keyword === "") {
			alert("Tidak ada keyword");
		} else {
			this.props.changeKeyword(keyword);
		}
	},
	render: function() {
		return (
			<div className="col-md-12">
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
					<div className="form-group">
						<div className="col-sm-11">
							<input type="text" className="form-control" placeholder="Search books..." ref="keyword"/>
						</div>
						<button type="submit" className="btn btn-default">
							<span className="glyphicon glyphicon-search"></span>
						</button>
					</div>
				</form>
			</div>
		);
	}
});

var CategoryResult = React.createClass({
    loadData: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({categories: data.results});
            }.bind(this),
            error: function (xhr, status, err) {
                console.log(xhr);
                console.log(status);
                console.log(err);
            }.bind(this)
        });
    },
	getInitialState: function () {
		return {categories: [], books: []};
	},
	componentDidMount: function () {
		this.loadData();
	},
	searchBooks: function(keyword) {
		var newBooks = [];
		var promise = [];
		
		var createPromise = function(url, tipe) {
			var full_url = "./data/best-sellers/" + url + ".json";
			return $.ajax({
				url: full_url,
				dataType: 'json',
				success: function (data) {
					var list = data.results.books;
					for (var i = 0, len = list.length; i < len; i++) {
						if (list[i].title.toLowerCase().indexOf(keyword) > -1) {
							newBooks.push({title: list[i].title, tipe: tipe});
						}
					}
				}
			});
		}
		
		for (var i = 0, len = this.state.categories.length; i < len; i++) {
			promise.push(createPromise(this.state.categories[i].list_name_encoded,
			this.state.categories[i].display_name));
		}
		
		$.when.apply($, promise).always(function(args) {
			this.setState({categories: this.state.categories, books: newBooks});
		}.bind(this));
	},
	componentWillReceiveProps: function (next_prop) {
		if (next_prop.searchKey && this.props.searchKey != next_prop.searchKey) {
			this.searchBooks(next_prop.searchKey);
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return nextProps.searchKey === this.props.searchKey;
	},
	render: function() {
		var book;
		var caption;
		if (this.props.searchKey !== "") {
			caption = <span>Search result of {this.props.searchKey === "" ? "..." : this.props.searchKey}</span>;
		}
		if (this.state.books.length > 0) {
			books = this.state.books.map(function(data) {
				return (
					<tr>
						<td>{data.title}</td>
						<td>{data.tipe}</td>
					</tr>
				);
			});
			book = (
				<table className="table table-stripped">
					<thead>
						<tr>
							<th>Title</th>
							<th>Type</th>
						</tr>
					</thead>
					<tbody>
					{books}
					</tbody>
				</table>
			);
		} else if (this.props.searchKey !== "") {
			book = <div>No result</div>;
		}
		
		return (
			<div className="col-md-8">
				{caption}
				{book}
			</div>
		);
	}
});

var CategoryList = React.createClass({
    loadData: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({categories: data.results});
            }.bind(this),
            error: function (xhr, status, err) {
                console.log(xhr);
                console.log(status);
                console.log(err);
            }.bind(this)
        });
    },
	getInitialState: function () {
		return {categories: []};
	},
	componentDidMount: function () {
		this.loadData();
	},
	render: function() {
		var items = this.state.categories.map(function (c) {
			var btnType   = this.props.active === c["list_name_encoded"]? "btn-primary": "btn-default",
				classList = "btn " + btnType;

			return (
					<a href={ "#" + c["list_name_encoded"] }
					   className={classList}
					   key={c["list_name_encoded"]}
					   ref={c["list_name_encoded"]}
					   /*onClick={this.handleListClick.bind(this, c["list_name_encoded"], c["display_name"])}*/>
						{c["display_name"]}
					</a>
			);
		}.bind(this));
		
		return (
			<div className="col-md-4">
				<div className="btn-group-vertical" id="catlist">
					{items}
				</div>
			</div>
		);
	}
});

var BestSeller = React.createClass({
	getInitialState: function() {
		return {keyword: ""};
	},
	handleKeywordChange:function(value) {
		this.setState({keyword: value});
	},
	render: function() {
		return (
			<div className="col-md-12">
				<h2>New York Times Best Seller</h2>
				<CategorySearch changeKeyword={this.handleKeywordChange} />
				<CategoryResult url={this.props.url} searchKey={this.state.keyword} />
				<CategoryList url={this.props.url}/>
			</div>
		);
	}
});

React.render(<BestSeller url="./data/all-names.json" />, main_container);