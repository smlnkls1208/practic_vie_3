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
        <div class="card">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
            <p><strong>Создано:</strong> {{ card.createdAt }}</p>
            <p><strong>Дедлайн:</strong> {{ card.deadline }}</p>
            <div class="card-buttons">
                <button v-if="columnIndex < 3" @click="$emit('move-card', columnIndex + 1)" class="move">Переместить</button>
                <button v-if="columnIndex === 0" @click="$emit('delete-card')" class="delete">Удалить</button>
            </div>
        </div>
    `
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
                @delete-card="$emit('delete-card', columnIndex, index)"
                @move-card="(toColumnIndex) => $emit('move-card', columnIndex, index, toColumnIndex)">
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
                            deadline: "25.02.2026"
                        },
                        {
                            id: 2,
                            title: "API для авторизации",
                            description: "Разработать REST API для входа пользователей",
                            createdAt: "20.02.2026, 11:15:00",
                            deadline: "28.02.2026"
                        }
                    ]
                },
                {
                    title: "Задачи в работе",
                    cards: []
                },
                {
                    title: "Тестирование",
                    cards: []
                },
                {
                    title: "Выполненные задачи",
                    cards: []
                }
            ],
            isModalVisible: false,
            isEditing: false,
            currentCard: {
                title: '',
                description: '',
                deadline: '',
                createdAt: ''
            }
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
                createdAt: new Date().toLocaleString()
            }
        },
        saveCard() {
            this.columns[0].cards.push({ ...this.currentCard, id: Date.now() })
            this.closeModal()
            this.saveData()
        },
        deleteCard(columnIndex, cardIndex) {
            this.columns[columnIndex].cards.splice(cardIndex, 1)
            this.saveData()
        },
        moveCard(fromColumnIndex, cardIndex, toColumnIndex) {
            const card = this.columns[fromColumnIndex].cards.splice(cardIndex, 1)[0]
            this.columns[toColumnIndex].cards.push(card)
            this.saveData()
        },
        closeModal() {
            this.isModalVisible = false
        },
        saveData() {
            localStorage.setItem("columns", JSON.stringify(this.columns))
        }
    }
})