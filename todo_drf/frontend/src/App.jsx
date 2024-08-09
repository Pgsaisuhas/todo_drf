import React from "react";
import axios from "axios";
import './App.css'
const BaseURL = "http://127.0.0.1:8000/api";
class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			todoList: [],
			activeItem: {
				id: null,
				title: "",
				completed: false,
			},
			editing: false,
		};
		this.fetchTasks = this.fetchTasks.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getCookie = this.getCookie.bind(this);
		this.startEdit = this.startEdit.bind(this);
		this.deleteItem = this.deleteItem.bind(this);
		this.stikeUnstrike = this.stikeUnstrike.bind(this);
	}

	getCookie(name){
		var cookieValue = null;
		if (document.cookie && document.cookie !== ''){
			var cookies = document.cookie.split(';')
			for(var i=0; i<cookies.length; i++){
				var cookie = cookies[i].trim()
				if(cookie.substring(0, name.length + 1) === (name + '=')){
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
					break
				}
			}
		}
		return cookie
	}

	componentDidMount() {
		this.fetchTasks();
	}

	fetchTasks() {
		console.log("fetching...");

		fetch(BaseURL + "/task-list/")
		.then(res => res.json())
		.then(data => 
			this.setState({
				todoList: data
			})
		)
	}

	handleChange(e){
		var name = e.target.name
		var value = e.target.value
		console.log("name:", name," value: ", value)
		this.setState({
			activeItem: {
				...this.state.activeItem,
				title: value,
			}
		})
	}

	handleSubmit(e){
		e.preventDefault();
		console.log('Item: ', this.state.activeItem)

		var csrftoken = this.getCookie('csrftoken')

		var url = BaseURL + /task-create/;
		if(this.state.editing === true){
			url = BaseURL + `/task-update/${this.state.activeItem.id}/`;
			this.setState({
				editing: false
			})
		}
		fetch(url, {
			method: 'POST',
			headers:{
				'Content-type': 'application/json',
				'x-CSRFToken': csrftoken,
			},
			body:JSON.stringify(this.state.activeItem)
		})
		.then((Response) => {
			this.fetchTasks()
			this.setState({
				activeItem: {
				id: null,
				title: "",
				completed: false,
			},
			})
		})
		.catch((err) => console.log('Error:', err))
	}


	startEdit(task){
		this.setState({
			activeItem: task,
			editing: true
		})
	}

	deleteItem(task){
		var csrftoken = this.getCookie("csrftoken")
		var url = BaseURL + `/task-delete/${task.id}/`;
		fetch(url, {
			method: "DELETE",
			headers: {
				"Content-type": "application/json",
				"x-CSRFToken": csrftoken,
			},
		}).then((res) => {
			this.fetchTasks()
		})
	}

	stikeUnstrike(task){
		task.completed = !task.completed
		console.log('Task: ', task.completed)
		var url = BaseURL + `/task-update/${task.id}/`;
		var csrftoken = this.getCookie("csrftoken");

		fetch(url, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				"x-CSRFToken": csrftoken,
			},
			body: JSON.stringify({
				"completed": task.completed,
				'title': task.title
			})
		}).then(()=>{
			this.fetchTasks()
		});
	}

	render() {

		var tasks = this.state.todoList
		var self = this
		return (
			<div id="task-container">
				<div id="form-wrapper">
					<form onSubmit={this.handleSubmit} id="form">
						<div className="flex-wrapper">
							<div style={{ flex: 6 }}>
								<input
									onChange={this.handleChange}
									type="text"
									className="form-control"
									id="title"
									name="title"
									placeholder="Add Task..."
									value={this.state.activeItem.title}
								/>
							</div>
							<div style={{ flex: 1 }}>
								<input
									type="submit"
									className="btn btn-warning"
									id="submit"
									name="add"
								/>
							</div>
						</div>
					</form>
				</div>
				<div id="list-wrapper">
					{tasks.map(function(task, index){
						return (
							<div key={index} className="task-wrapper flex-wrapper">
								<div onClick={() => self.stikeUnstrike(task)} style={{ flex: 7, margin: 5 }}>
									{task.completed == false ? (
										<span>{task.title}</span>
									) : (
										<strike>{task.title}</strike>
									)}
								</div>
								<div style={{ flex: 1, margin: 5 }}>
									<button
										onClick={() => self.startEdit(task)}
										className="btn btn-sm btn-outline-info"
									>
										Edit
									</button>
								</div>
								<div style={{ flex: 1, margin: 5 }}>
									<button
										onClick={() => self.deleteItem(task)}
										className="btn btn-sm btn-outline-dark delete"
									>
										Delete
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

export default App;
