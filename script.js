// التطبيق الرئيسي
window.ExamApp = {
    // البيانات
    allQuestions: {
        political: [],
        economic: [],
        social: [],
        education: [],
        palestine: []
    },
    currentUnit: '',
    currentQuestions: [],
    currentIndex: 0,
    userAnswers: [],
    score: 0,
    
    // عناصر DOM
    elements: {
        menuScreen: null,
        quizScreen: null,
        resultArea: null,
        quizArea: null,
        loadingArea: null,
        unitTitle: null,
        progressText: null,
        progressFill: null,
        questionText: null,
        optionsContainer: null,
        scoreValue: null,
        totalQuestionsValue: null,
        resultMessage: null,
        resultPercentage: null,
        answersReview: null
    },
    
    // تهيئة التطبيق
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.loadQuestions();
    },
    
    cacheElements() {
        this.elements.menuScreen = document.getElementById('menuScreen');
        this.elements.quizScreen = document.getElementById('quizScreen');
        this.elements.resultArea = document.getElementById('resultArea');
        this.elements.quizArea = document.getElementById('quizArea');
        this.elements.loadingArea = document.getElementById('loadingArea');
        this.elements.unitTitle = document.getElementById('unitTitle');
        this.elements.progressText = document.getElementById('progressText');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.questionText = document.getElementById('questionText');
        this.elements.optionsContainer = document.getElementById('optionsContainer');
        this.elements.scoreValue = document.getElementById('scoreValue');
        this.elements.totalQuestionsValue = document.getElementById('totalQuestionsValue');
        this.elements.resultMessage = document.getElementById('resultMessage');
        this.elements.resultPercentage = document.getElementById('resultPercentage');
        this.elements.answersReview = document.getElementById('answersReview');
    },
    
    attachEventListeners() {
        // أزرار الوحدات
        document.querySelectorAll('.menu-btn[data-unit]').forEach(btn => {
            btn.addEventListener('click', () => this.startUnit(btn.dataset.unit));
        });
        
        // الامتحان الشامل
        document.getElementById('comprehensiveBtn')?.addEventListener('click', () => this.startComprehensive());
        
        // أزرار الرجوع
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => this.backToMenu());
        document.getElementById('returnToMenuBtn')?.addEventListener('click', () => this.backToMenu());
        
        // زر السابق
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousQuestion());
    },
    
    loadQuestions() {
        fetch('questions.json')
            .then(res => res.json())
            .then(data => {
                this.allQuestions = data;
                this.showMenu();
            })
            .catch(err => {
                console.error('فشل تحميل الأسئلة:', err);
                alert('حدث خطأ في تحميل الأسئلة');
            });
    },
    
    showMenu() {
        this.elements.menuScreen.classList.remove('hidden');
        this.elements.quizScreen.classList.add('hidden');
    },
    
    startUnit(unitKey) {
        this.currentUnit = unitKey;
        const unitNames = {
            political: 'الحياة السياسية',
            economic: 'الحياة الاقتصادية',
            social: 'الحياة الاجتماعية',
            education: 'التعليم والثقافة',
            palestine: 'الأردن والقضية الفلسطينية'
        };
        this.elements.unitTitle.textContent = unitNames[unitKey];
        this.currentQuestions = [...this.allQuestions[unitKey]];
        this.startQuiz();
    },
    
    startComprehensive() {
        this.currentUnit = 'comprehensive';
        this.elements.unitTitle.textContent = 'الامتحان الشامل';
        const all = [
            ...this.allQuestions.political,
            ...this.allQuestions.economic,
            ...this.allQuestions.social,
            ...this.allQuestions.education,
            ...this.allQuestions.palestine
        ];
        this.currentQuestions = this.shuffleArray([...all]).slice(0, 50);
        this.startQuiz();
    },
    
    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    startQuiz() {
        this.currentIndex = 0;
        this.userAnswers = new Array(this.currentQuestions.length).fill(null);
        this.score = 0;
        
        this.elements.menuScreen.classList.add('hidden');
        this.elements.quizScreen.classList.remove('hidden');
        this.elements.resultArea.classList.add('hidden');
        this.elements.quizArea.classList.remove('hidden');
        this.elements.loadingArea.classList.add('hidden');
        
        this.renderQuestion();
    },
    
    renderQuestion() {
        const q = this.currentQuestions[this.currentIndex];
        if (!q) return;
        
        this.elements.questionText.textContent = q.question;
        this.elements.progressText.textContent = `سؤال ${this.currentIndex + 1} / ${this.currentQuestions.length}`;
        this.elements.progressFill.style.width = `${((this.currentIndex + 1) / this.currentQuestions.length) * 100}%`;
        
        // عرض الخيارات
        this.elements.optionsContainer.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            if (this.userAnswers[this.currentIndex] === opt) {
                btn.classList.add('selected');
            }
            btn.textContent = opt;
            btn.addEventListener('click', () => this.selectAnswer(opt));
            this.elements.optionsContainer.appendChild(btn);
        });
    },
    
    selectAnswer(option) {
        // تعديل النتيجة إذا كان هناك إجابة سابقة
        if (this.userAnswers[this.currentIndex] !== null) {
            const oldAnswer = this.userAnswers[this.currentIndex];
            if (oldAnswer === this.currentQuestions[this.currentIndex].correct) {
                this.score--;
            }
        }
        
        // تسجيل الإجابة الجديدة
        this.userAnswers[this.currentIndex] = option;
        if (option === this.currentQuestions[this.currentIndex].correct) {
            this.score++;
        }
        
        // الانتقال للسؤال التالي
        setTimeout(() => {
            if (this.currentIndex < this.currentQuestions.length - 1) {
                this.currentIndex++;
                this.renderQuestion();
            } else {
                this.showResult();
            }
        }, 200);
    },
    
    previousQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
        }
    },
    
    showResult() {
        this.elements.quizArea.classList.add('hidden');
        this.elements.resultArea.classList.remove('hidden');
        
        this.elements.scoreValue.textContent = this.score;
        this.elements.totalQuestionsValue.textContent = this.currentQuestions.length;
        
        const percentage = (this.score / this.currentQuestions.length) * 100;
        this.elements.resultPercentage.textContent = `نسبة الإجابة الصحيحة: ${percentage.toFixed(1)}%`;
        
        let message = '';
        if (percentage >= 90) message = 'ممتاز! حفظك الله للأردن وفلسطين';
        else if (percentage >= 75) message = 'جيد جداً! زادك الله علماً';
        else if (percentage >= 50) message = 'مقبول، واصل السير على نهج الأجداد';
        else message = 'حاول مرة أخرى، فالتاريخ ينتظرك';
        this.elements.resultMessage.textContent = message;
        
        // عرض مراجعة الإجابات
        this.elements.answersReview.innerHTML = '';
        this.currentQuestions.forEach((q, i) => {
            const isCorrect = this.userAnswers[i] === q.correct;
            const div = document.createElement('div');
            div.className = `answer-item ${isCorrect ? 'correct' : 'wrong'}`;
            div.innerHTML = `
                <strong>س${i + 1}:</strong>
                <div class="answer-question">${q.question}</div>
                <div class="answer-user">إجابتك: ${this.userAnswers[i] || 'لم تجب'}</div>
                <div class="answer-correct">الإجابة الصحيحة: ${q.correct}</div>
            `;
            this.elements.answersReview.appendChild(div);
        });
    },
    
    backToMenu() {
        this.elements.quizScreen.classList.add('hidden');
        this.elements.menuScreen.classList.remove('hidden');
    }
};

// تهيئة التطبيق بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // سيتم التهيئة من script الحماية بعد التحقق من الملفات
});
