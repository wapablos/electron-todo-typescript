import { app, ipcMain } from 'electron'
import * as path from 'path'
import Window from './window'
import DataStore from './data_store'

app.allowRendererProcessReuse = true

let mainWindow:Window,
    todoWindow:Window

let todoData = new DataStore({name: 'todo'})

let file = path.join(process.cwd(),'assets/index.html')
let addFile = path.join(process.cwd(),'assets/add.html')

function createMainWindow() {
    mainWindow = new Window(file)
    
    mainWindow.once('show',() => {
        mainWindow.webContents.send('todos', todoData.getTodos())
        //ele envia um array  caso contrario o receptor irar dar um erro de tipo
    })

    ipcMain.on('add-todo-window',createTodoWindow)
    
    ipcMain.on('add-todo',(event,todo:string) => {     
        let UTodoList = todoData.addTodo(todo).getTodos()
        mainWindow.webContents.send('todos',UTodoList)
    })

    ipcMain.on('delete-todo',(event,todo:string) => {
        let UTodoList =  todoData.deleteTodo(todo).getTodos()
        mainWindow.webContents.send('todos',UTodoList)
    })
}

function createTodoWindow(){
    if(!todoWindow) {
        todoWindow = new Window(addFile, {
            width: 200,
            height:200,
            parent: mainWindow,
            frame:false
        })

        todoWindow.on('closed',() => {
            todoWindow = null
        })

        todoWindow.removeMenu()
    }
}  

app.on('ready',createMainWindow)
app.on('window-all-closed',app.quit)