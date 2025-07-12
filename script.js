document.addEventListener('DOMContentLoaded', () => {
    // --- 캔버스 및 컨텍스트 설정 ---
    const unitCircleCanvas = document.getElementById('unitCircleCanvas');
    const uctx = unitCircleCanvas.getContext('2d');
    const graphCanvas = document.getElementById('graphCanvas');
    const gctx = graphCanvas.getContext('2d');

    // --- DOM 요소 가져오기 ---
    const angleSlider = document.getElementById('angle-slider');
    const angleDisplay = document.getElementById('angle-display');
    const sinValue = document.getElementById('sin-value');
    const cosValue = document.getElementById('cos-value');
    const tanValue = document.getElementById('tan-value');
    const functionButtons = document.querySelectorAll('.func-btn');

    // --- 상태 변수 ---
    let currentAngle = 0; // 도(degree) 단위
    let activeFunction = 'sin'; // 'sin', 'cos', 'tan'
    const unitCircleRadius = unitCircleCanvas.width / 2 - 30;
    const unitCircleCenterX = unitCircleCanvas.width / 2;
    const unitCircleCenterY = unitCircleCanvas.height / 2;

    // --- 단위 원 그리기 함수 ---
    function drawUnitCircle() {
        uctx.clearRect(0, 0, unitCircleCanvas.width, unitCircleCanvas.height);

        // 축 그리기
        uctx.beginPath();
        uctx.moveTo(0, unitCircleCenterY);
        uctx.lineTo(unitCircleCanvas.width, unitCircleCenterY);
        uctx.moveTo(unitCircleCenterX, 0);
        uctx.lineTo(unitCircleCenterX, unitCircleCanvas.height);
        uctx.strokeStyle = '#cbd5e1'; // gray-300
        uctx.stroke();

        // 원 그리기
        uctx.beginPath();
        uctx.arc(unitCircleCenterX, unitCircleCenterY, unitCircleRadius, 0, 2 * Math.PI);
        uctx.strokeStyle = '#94a3b8'; // gray-400
        uctx.lineWidth = 2;
        uctx.stroke();

        // 현재 각도를 라디안으로 변환
        const angleRad = currentAngle * Math.PI / 180;
        const x = unitCircleCenterX + unitCircleRadius * Math.cos(angleRad);
        const y = unitCircleCenterY - unitCircleRadius * Math.sin(angleRad); // 캔버스 y좌표는 아래로 증가

        // 동경(반지름 선) 그리기
        uctx.beginPath();
        uctx.moveTo(unitCircleCenterX, unitCircleCenterY);
        uctx.lineTo(x, y);
        uctx.strokeStyle = '#2563eb'; // blue-600
        uctx.lineWidth = 3;
        uctx.stroke();
        
        // sin, cos 선 그리기
        // cos(θ) - x좌표 (빨간색)
        uctx.beginPath();
        uctx.moveTo(x, y);
        uctx.lineTo(x, unitCircleCenterY);
        uctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // red-500
        uctx.lineWidth = 2;
        uctx.stroke();
        
        // sin(θ) - y좌표 (초록색)
        uctx.beginPath();
        uctx.moveTo(x, y);
        uctx.lineTo(unitCircleCenterX, y);
        uctx.strokeStyle = 'rgba(34, 197, 94, 0.7)'; // green-500
        uctx.lineWidth = 2;
        uctx.stroke();

        // 원 위의 점 그리기
        uctx.beginPath();
        uctx.arc(x, y, 6, 0, 2 * Math.PI);
        uctx.fillStyle = '#2563eb'; // blue-600
        uctx.fill();
    }

    // --- 그래프 그리기 함수 ---
    function drawGraph() {
        gctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
        const width = graphCanvas.width;
        const height = graphCanvas.height;
        const centerY = height / 2;
        const scaleX = width / (2 * Math.PI); // 0부터 2π까지를 캔버스 너비에 맞춤
        const scaleY = height / 4; // -2부터 2까지를 캔버스 높이에 맞춤

        // 축 그리기
        gctx.beginPath();
        gctx.moveTo(0, centerY);
        gctx.lineTo(width, centerY);
        gctx.moveTo(0, 0);
        gctx.lineTo(0, height);
        gctx.strokeStyle = '#cbd5e1'; // gray-300
        gctx.stroke();
        
        // π, 2π 표시
        gctx.fillStyle = '#6b7280'; // gray-500
        gctx.fillText('π', Math.PI * scaleX - 5, centerY + 15);
        gctx.fillText('2π', 2 * Math.PI * scaleX - 15, centerY + 15);


        // 함수 그래프 그리기
        gctx.beginPath();
        let func;
        switch (activeFunction) {
            case 'sin':
                func = Math.sin;
                gctx.strokeStyle = '#16a34a'; // green-600
                break;
            case 'cos':
                func = Math.cos;
                gctx.strokeStyle = '#dc2626'; // red-600
                break;
            case 'tan':
                func = Math.tan;
                gctx.strokeStyle = '#7e22ce'; // purple-700
                break;
        }
        gctx.lineWidth = 2;

        for (let i = 0; i < width; i++) {
            const xRad = i / scaleX;
            const yVal = func(xRad);
            const y = centerY - yVal * scaleY;

            if (i === 0) {
                gctx.moveTo(i, y);
            } else {
                // 탄젠트 점근선 처리
                if (activeFunction === 'tan' && Math.abs(yVal) > 10) {
                    gctx.moveTo(i + 1, centerY - func((i + 1) / scaleX) * scaleY);
                } else {
                    gctx.lineTo(i, y);
                }
            }
        }
        gctx.stroke();

        // 현재 각도 위치 표시
        const currentXRad = currentAngle * Math.PI / 180;
        const currentXCanvas = currentXRad * scaleX;
        const currentYVal = func(currentXRad);
        const currentYCanvas = centerY - currentYVal * scaleY;
        
        if (Math.abs(currentYVal) < 10) { // 탄젠트 무한대 값 제외
            gctx.beginPath();
            gctx.arc(currentXCanvas, currentYCanvas, 5, 0, 2 * Math.PI);
            gctx.fillStyle = gctx.strokeStyle;
            gctx.fill();
        }
    }

    // --- 값 업데이트 함수 ---
    function updateValues() {
        const angleRad = currentAngle * Math.PI / 180;
        const sin = Math.sin(angleRad);
        const cos = Math.cos(angleRad);
        const tan = Math.tan(angleRad);

        angleDisplay.textContent = `${currentAngle}°`;
        sinValue.textContent = sin.toFixed(2);
        cosValue.textContent = cos.toFixed(2);
        
        // tan 값이 무한대에 가까워지는 경우 처리
        if (Math.abs(cos) < 0.001) {
            tanValue.textContent = '∞';
        } else {
            tanValue.textContent = tan.toFixed(2);
        }
    }

    // --- 전체 업데이트 및 그리기 함수 ---
    function redrawAll() {
        updateValues();
        drawUnitCircle();
        drawGraph();
    }

    // --- 이벤트 리스너 ---
    angleSlider.addEventListener('input', (e) => {
        currentAngle = parseInt(e.target.value);
        redrawAll();
    });

    functionButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeFunction = button.dataset.func;
            // 활성 버튼 스타일 변경
            functionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            redrawAll();
        });
    });

    // --- 퀴즈 기능 ---
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submit-quiz');
    const quizResult = document.getElementById('quiz-result');

    const quizQuestions = [
        {
            question: "sin(90°)의 값은 무엇일까요?",
            options: ["0", "1", "-1", "0.5"],
            answer: "1"
        },
        {
            question: "cos(π) 라디안의 값은 무엇일까요?",
            options: ["0", "1", "-1", "π"],
            answer: "-1"
        },
        {
            question: "tan(45°)의 값은 무엇일까요?",
            options: ["0", "1", "√2", "정의되지 않음"],
            answer: "1"
        },
        {
            question: "사인의 주기는 얼마일까요?",
            options: ["π/2", "π", "2π", "4π"],
            answer: "2π"
        }
    ];

    function buildQuiz() {
        quizQuestions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('quiz-question');
            
            const questionText = document.createElement('p');
            questionText.className = 'font-semibold mb-2';
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionDiv.appendChild(questionText);

            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('quiz-options');
            optionsDiv.dataset.questionIndex = index;

            q.options.forEach(option => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question${index}`;
                radio.value = option;
                
                label.appendChild(radio);
                label.append(` ${option}`);
                optionsDiv.appendChild(label);
            });

            questionDiv.appendChild(optionsDiv);
            quizContainer.appendChild(questionDiv);
        });
    }

    submitQuizBtn.addEventListener('click', () => {
        let score = 0;
        const allOptionLabels = document.querySelectorAll('.quiz-options label');
        allOptionLabels.forEach(label => {
            label.classList.remove('correct', 'incorrect');
        });


        quizQuestions.forEach((q, index) => {
            const optionsDiv = document.querySelector(`.quiz-options[data-question-index="${index}"]`);
            const selected = optionsDiv.querySelector(`input[name="question${index}"]:checked`);
            
            if (selected) {
                const selectedLabel = selected.parentElement;
                if (selected.value === q.answer) {
                    score++;
                    selectedLabel.classList.add('correct');
                } else {
                    selectedLabel.classList.add('incorrect');
                    // 정답도 표시
                    const correctLabel = optionsDiv.querySelector(`input[value="${q.answer}"]`).parentElement;
                    correctLabel.classList.add('correct');
                }
            }
        });

        quizResult.textContent = `결과: ${quizQuestions.length}문제 중 ${score}문제를 맞혔습니다!`;
        if(score === quizQuestions.length) {
            quizResult.textContent += " 🎉 완벽해요!";
            quizResult.style.color = '#16a34a';
        } else {
             quizResult.style.color = '#dc2626';
        }
    });

    // --- 초기화 ---
    buildQuiz();
    redrawAll();
});