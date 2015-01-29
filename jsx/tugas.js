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
	componentWillReceiveProps: function (next_prop) {
		if (next_prop.searchKey && this.props.searchKey != next_prop.searchKey) {
			this.searchBooks(next_prop.searchKey);
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return nextProps.searchKey === this.props.searchKey;
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
							list[i].tipe = tipe;
							newBooks.push(list[i]);
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
	displayInfo: function(book) {
		this.props.selectBook(book);
	},
	render: function() {
		var book;
		var caption;
		if (this.props.searchKey !== "") {
			caption = <span>Search result of "{this.props.searchKey === "" ? "..." : this.props.searchKey}"</span>;
		}
		if (this.state.books.length > 0) {
			var md = [];
			book = this.state.books.map(function(data, i) {
				var book_key = "book-" + i;
				md.push(
					<div key={book_key} className="col-md-2">
						<span>
							<a href="#" onClick={this.displayInfo.bind(this, data)}>
								<img src={data.book_image} alt={data.title} className="img-responsive"/>
								{data.title}
							</a> - {data.tipe}
						</span>
					</div>
				);
				if (i % 6 === 5 || i === this.state.books.length - 1) {
					var books = md.map(function(b) { return b; });
					var row_key = "row-book-" + parseInt(i / 6);
					md = [];
					return (
						<div key={row_key} className="row">
							{books}
						</div>
					)
				}
			}.bind(this));
		} else if (this.props.searchKey !== "") {
			book = <div>No result</div>;
		}
		
		return (
			<div className="col-md-12">
				<h4 className="col-md-12">{caption}</h4>
				{book}
			</div>
		);
	}
});

var Dialog = React.createClass({
	getInitialState: function() {
		return {visible: false};
	},
	componentWillReceiveProps: function (next_prop) {
		if (next_prop.book) {
			this.setState({visible: true});
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return nextState.visible !== this.state.visible;
	},
	close: function() {
		this.setState({visible: false});
	},
	render: function() {
		var css;
		var bg;
		if (this.state.visible) {
			css = "modal modal-open fade in show"
			bg = <div className="modal-backdrop fade in bg-dialog"></div>;
		} else {
			css = "modal fade"
		}
		var book = this.props.book;
		return (
			<div className={css}>
				{bg}
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" aria-label="Close" onClick={this.close}>
								<span aria-hidden="true">&times;</span>
							</button>
							<h4 className="modal-title">{book && book.title}</h4>
						</div>
						<div className="modal-body">
							<div className="row">
								<div className="col-md-4">
									<img src={book && book.book_image} alt={book && book.title} className="img-responsive"/>
								</div>
								<div className="col-md-8">
									<div className="col-md-4">
										<div>Author</div>
										<div>Publisher</div>
										<div>ISBN</div>
										<div>Description</div>
									</div>
									<div className="col-md-8">
										<div>{book && book.author || "-"}</div>
										<div>{book && book.publisher || "-"}</div>
										<div>{book && book.primary_isbn10 || "-"}</div>
										<div>{book && book.description || "-"}</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<a href={book && book.amazon_product_url} target="_blank" className="btn btn-primary">Amazon Link</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var BestSeller = React.createClass({
	getInitialState: function() {
		return {keyword: "", selectedBooks: null};
	},
	handleKeywordChange:function(value) {
		this.setState({keyword: value, selectedBooks: this.state.selectedBooks});
	},
	handleBookSelected: function(book) {
		this.setState({keyword: this.state.keyword, selectedBooks: book});
	},
	render: function() {
		return (
			<div className="col-md-12">
				<h2>New York Times Best Seller</h2>
				<CategorySearch changeKeyword={this.handleKeywordChange} />
				<CategoryResult url={this.props.url} searchKey={this.state.keyword} selectBook={this.handleBookSelected} />
				<Dialog book={this.state.selectedBooks}/>
			</div>
		);
	}
});

React.render(<BestSeller url="./data/all-names.json" />, main_container);