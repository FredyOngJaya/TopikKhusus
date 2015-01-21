var TodoForm = React.createClass({
    render: function () {
        return (
            <div className="todoForm">
                <label htmlFor="todoInput">
                    { this.props.teks }
                </label>
                <input type="text" id="todoInput" className="inputForm" />
            </div>
        );
    }
});

var judul = "Tambahkan Data : ";

// data boleh berasal dari mana saja.
// asumsikan data sudah didapatkan.
var data = [
    {content: "Beli Telur", tag: "belanja"},
    {content: "Tugas Javascript", tag: "kuliah"},
    {content: "This War of Mine", tag: "game"},
    {content: "Doraemon", tag: "film"}
];

var List = React.createClass({
    loadData: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function (data) {
                this.setState({data: data})
            }.bind(this),
            error: function (xhr, status, err) {
                console.log(xhr);
                console.log(status);
                console.log(err);
            }.bind(this)
        });
    },
    getInitialState: function () {
        return { data: [] }
    },
    componentDidMount: function () {
        this.loadData();
    },
    render: function () {
        var listData = this.state.data.map(function (data) {
            return (
                <li>{data.content}, tag: {data.tag}</li>
            );
        });

        return (
            <ul className="list">
                {listData}
            </ul>
        );
    }
});

var TodoList = React.createClass({
    render: function () {
        return (
            <div className="TodoList">
                <h1>Todo List</h1>
                <TodoForm teks={judul} />
                <List url={this.props.url} />
            </div>
        );
    }
});

React.render(
    <TodoList url="./data.json" />,
    document.getElementById("content")
);