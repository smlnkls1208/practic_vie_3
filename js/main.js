Vue.component('card-component', {
    props: {
        card: {
            type: Object,
            required: true
        },
        columnIndex: {
            type: Number,
            required: true
        }
    },
    template: `
        <div class="card" :class="{ 'completed': card.status === 'Выполнено в срок', 'overdue': card.status === 'Просрочено', 'in-progress': columnIndex === 1, 'testing': columnIndex === 2 }">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p><strong>Создано:</strong> {{ card.createdAt }}</p>
            <p><strong>Дедлайн:</strong> {{ card.deadline }}</p>
            <p><strong>Последнее редактирование:</strong> {{ card.updatedAt || 'Не редактировалось' }}</p>
            <div v-if="card.tasks && card.tasks.length > 0" class="task-list">
                <strong>Задачи ({{ completedTasksCount }}/{{ card.tasks.length }}):</strong>
                <ul>
                    <li v-for="(task, idx) in card.tasks" :key="idx">
                        <label>
                            <input type="checkbox" :checked="task.completed" @change="$emit('toggle-task', idx)" :disabled="columnIndex === 3">
                            <span :class="{ 'completed-task': task.completed }">{{ task.text }}</span>
                        </label>
                    </li>
                </ul>
            </div>
            <div v-if="card.returnReasons && card.returnReasons.length > 0" class="return-history">
                <strong>История возвратов:</strong>
                <ul>
                    <li v-for="(item, idx) in card.returnReasons" :key="idx">
                        <span class="return-date">{{ item.date }}</span>
                        <span class="return-reason">{{ item.reason }}</span>
                    </li>
                </ul>
            </div>
            <p v-if="card.status"><strong>Статус:</strong> {{ card.status }}</p>
            <div class="card-buttons">
                <button v-if="columnIndex !== 3" @click="$emit('edit-card')" class="edit">Редактировать</button>
                <button v-if="columnIndex !== 3" @click="$emit('manage-tasks')" class="tasks">Задачи</button>
                <button v-if="columnIndex < 3" @click="$emit('move-card', columnIndex + 1)" class="move">Переместить</button>
                <button v-if="columnIndex === 0" @click="$emit('delete-card')" class="delete">Удалить</button>
                <button v-if="columnIndex === 2" @click="returnToWork" class="return">Вернуть в работу</button>
            </div>
        </div>
    `,
    computed: {
        completedTasksCount() {
            if (!this.card.tasks) return 0
            return this.card.tasks.filter(t => t.completed).length
        }
    },
    methods: {
        returnToWork() {
            const reason = prompt('Укажите причину возврата:')
            if (reason) {
                this.$emit('move-card', 1, reason)
            }
        }
    }
})

Vue.component('column-component', {
    props: {
        column: {
            type: Object,
            required: true
        },
        columnIndex: {
            type: Number,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }} ({{ column.cards.length }})</h2>
            <card-component
                v-for="(card, index) in column.cards"
                :key="card.id"
                :card="card"
                :columnIndex="columnIndex"
                @edit-card="$emit('edit-card', columnIndex, index)"
                @delete-card="$emit('delete-card', columnIndex, index)"
                @move-card="(toColumnIndex, reason) => $emit('move-card', columnIndex, index, toColumnIndex, reason)"
                @toggle-task="(taskIndex) => $emit('toggle-task', columnIndex, index, taskIndex)"
                @manage-tasks="$emit('manage-tasks', columnIndex, index)">
            </card-component>
            <button v-if="columnIndex === 0" @click="$emit('add-card')">Добавить карточку</button>
        </div>
    `
})

new Vue({
    el: '#app',
    data() {
        return {
            columns: JSON.parse(localStorage.getItem("columns")) || [
                {
                    title: "Запланированные задачи",
                    cards: [
                        {
                            id: 1,
                            title: "Дизайн главной страницы",
                            description: "Создать макет главной страницы сайта",
                            createdAt: "20.02.2026, 10:30:00",
                            deadline: "25.02.2026",
                            updatedAt: ""
                        },
                        {
                            id: 2,
                            title: "API для авторизации",
                            description: "Разработать REST API для входа пользователей",
                            createdAt: "20.02.2026, 11:15:00",
                            deadline: "28.02.2026",
                            updatedAt: ""
                        }
                    ]
                },
                {
                    title: "Задачи в работе",
                    cards: [
                        {
                            id: 3,
                            title: "Верстка адаптивного меню",
                            description: "Создать меню, адаптивное для мобильных устройств",
                            createdAt: "19.02.2026, 09:00:00",
                            deadline: "23.02.2026",
                            updatedAt: "20.02.2026, 15:45:00"
                        }
                    ]
                },
                {
                    title: "Тестирование",
                    cards: [
                        {
                            id: 4,
                            title: "Тестирование формы входа",
                            description: "Провести функциональное тестирование формы авторизации",
                            createdAt: "18.02.2026, 14:00:00",
                            deadline: "22.02.2026",
                            updatedAt: "20.02.2026, 12:00:00"
                        }
                    ]
                },
                {
                    title: "Выполненные задачи",
                    cards: [
                        {
                            id: 5,
                            title: "Настройка базы данных",
                            description: "Инициализировать PostgreSQL базу данных",
                            createdAt: "15.02.2026, 08:00:00",
                            deadline: "18.02.2026",
                            updatedAt: "18.02.2026, 16:30:00",
                            status: "Выполнено в срок"
                        },
                        {
                            id: 6,
                            title: "Установка Node.js",
                            description: "Установить и настроить окружение Node.js",
                            createdAt: "14.02.2026, 10:00:00",
                            deadline: "16.02.2026",
                            updatedAt: "16.02.2026, 14:00:00",
                            status: "Выполнено в срок"
                        }
                    ]
                }
            ],
            isModalVisible: false,
            isTaskModalVisible: false,
            isEditing: false,
            currentCard: {
                title: '',
                description: '',
                deadline: '',
                createdAt: '',
                updatedAt: '',
                tasks: []
            },
            editIndex: null,
            newTaskText: '',
            taskEditIndex: null,
            editingCardTasks: null
        }
    },
    methods: {
        openModal() {
            this.isModalVisible = true
            this.isEditing = false
            this.currentCard = {
                title: '',
                description: '',
                deadline: '',
                createdAt: new Date().toLocaleString(),
                updatedAt: '',
                tasks: []
            }
            this.newTaskText = ''
        },
        editCard(columnIndex, cardIndex) {
            this.isModalVisible = true
            this.isEditing = true
            this.currentCard = { ...this.columns[columnIndex].cards[cardIndex] }
            this.editIndex = { columnIndex, cardIndex }
        },
        saveCard() {
            if (this.isEditing) {
                this.currentCard.updatedAt = new Date().toLocaleString()
                Vue.set(this.columns[this.editIndex.columnIndex].cards, this.editIndex.cardIndex, { ...this.currentCard })
            } else {
                this.columns[0].cards.push({ ...this.currentCard, id: Date.now() })
            }
            this.closeModal()
            this.saveData()
        },
        deleteCard(columnIndex, cardIndex) {
            this.columns[columnIndex].cards.splice(cardIndex, 1)
            this.saveData()
        },
        moveCard(fromColumnIndex, cardIndex, toColumnIndex, reason) {
            const card = this.columns[fromColumnIndex].cards[cardIndex]

            if (toColumnIndex === 3) {
                if (card.tasks && card.tasks.length > 0) {
                    const allCompleted = card.tasks.every(t => t.completed)
                    if (!allCompleted) {
                        alert('Невозможно переместить карточку в "Выполненные задачи". Не все задачи выполнены!')
                        return
                    }
                }
                const deadline = new Date(card.deadline)
                const now = new Date()
                card.status = deadline < now ? 'Просрочено' : 'Выполнено в срок'
            }

            this.columns[fromColumnIndex].cards.splice(cardIndex, 1)

            if (reason) {
                if (!card.returnReasons) {
                    card.returnReasons = []
                }
                card.returnReasons.push({
                    date: new Date().toLocaleString(),
                    reason: reason
                })
            }
            this.columns[toColumnIndex].cards.push(card)
            this.saveData()
        },
        toggleTask(columnIndex, cardIndex, taskIndex) {
            const card = this.columns[columnIndex].cards[cardIndex]
            card.tasks[taskIndex].completed = !card.tasks[taskIndex].completed
            this.saveData()
        },
        openTaskModal(columnIndex, cardIndex) {
            this.isTaskModalVisible = true
            this.taskEditIndex = { columnIndex, cardIndex }
            const card = this.columns[columnIndex].cards[cardIndex]
            if (!card.tasks) {
                Vue.set(card, 'tasks', [])
            }
            this.editingCardTasks = card.tasks
            this.newTaskText = ''
        },
        closeTaskModal() {
            this.isTaskModalVisible = false
            this.taskEditIndex = null
            this.editingCardTasks = null
            this.newTaskText = ''
            this.saveData()
        },
        addTaskToCard() {
            if (this.newTaskText.trim() && this.taskEditIndex) {
                const card = this.columns[this.taskEditIndex.columnIndex].cards[this.taskEditIndex.cardIndex]
                if (!card.tasks) {
                    Vue.set(card, 'tasks', [])
                }
                card.tasks.push({
                    text: this.newTaskText.trim(),
                    completed: false
                })
                this.newTaskText = ''
            }
        },
        removeTaskFromCard(taskIndex) {
            if (this.taskEditIndex) {
                const card = this.columns[this.taskEditIndex.columnIndex].cards[this.taskEditIndex.cardIndex]
                card.tasks.splice(taskIndex, 1)
            }
        },
        addTask() {
            if (this.newTaskText.trim()) {
                this.currentCard.tasks.push({
                    text: this.newTaskText.trim(),
                    completed: false
                })
                this.newTaskText = ''
            }
        },
        removeTask(index) {
            this.currentCard.tasks.splice(index, 1)
        },
        closeModal() {
            this.isModalVisible = false
        },
        saveData() {
            localStorage.setItem("columns", JSON.stringify(this.columns))
        }
    }
})