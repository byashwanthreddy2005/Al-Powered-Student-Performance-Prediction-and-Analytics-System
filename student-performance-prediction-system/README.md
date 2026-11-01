# EduPredict AI — AI-Powered Student Performance Prediction & Analytics System

[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF.svg)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-F7931E.svg)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, full-stack educational analytics and machine learning web application designed to forecast student final examination scores, identify academically at-risk learners early, and deliver actionable personalized academic recommendations.

Developed as a showcase project for **B.Tech Artificial Intelligence & Data Science** portfolios and resumes.

---

## 1. System Architecture & Features

```
+---------------------------------------------------------------------------------------+
|                                    REACT FRONTEND                                     |
|               (Vite + Tailwind CSS + Recharts + Lucide Icons + Dark Mode)             |
|                                                                                       |
|  [Dashboard] [Student Management] [Predict] [CSV Upload] [Analytics] [Model] [Report] |
+-------------------------------------------+-------------------------------------------+
                                            | REST API Requests (/api/*)
                                            v
+---------------------------------------------------------------------------------------+
|                                   FASTAPI BACKEND                                     |
|                                                                                       |
|  • Endpoints Router (/api/students, /api/predict, /api/dashboard, /api/reports)       |
|  • Pydantic v2 Request & Response Validation                                          |
|  • Domain Services (Student, Prediction, Recommendation, Analytics)                   |
+---------------------+-------------------------------------+---------------------------+
                      |                                     |
                      v                                     v
+-----------------------------------+     +---------------------------------------------+
|          DATABASE LAYER           |     |           MACHINE LEARNING ENGINE           |
|          (SQLite + SQLAlchemy)    |     |           (Scikit-learn + Joblib)           |
|                                   |     |                                             |
|  • Students Table                 |     |  • Pipeline: StandardScaler + Regressor     |
|  • Prediction History Table       |     |  • Models: Random Forest & Linear Regression|
|  • Synthetic Seed Records         |     |  • 5-Fold Cross Validation + Held-Out Test  |
|                                   |     |  • Feature Importances & Directional Impact |
+-----------------------------------+     +---------------------------------------------+
```

---

## 2. Core Modules & Functionality

### 1. Executive Dashboard
- **Real-Time KPIs**: Total enrolled students, average attendance percentage, average previous examination marks, predicted final examination average, and at-risk student count.
- **6 Interactive Recharts Visualizations**:
  1. *Attendance vs Academic Performance* (Scatter chart)
  2. *Study Hours vs Examination Marks* (Scatter chart)
  3. *Student Performance Distribution* (Donut chart with custom color mapping)
  4. *Predicted Marks vs Actual Marks* (Dual-bar comparison chart for validated records)
  5. *Assignment Completion vs Performance* (Scatter trend)
  6. *Machine Learning Feature Importance* (Horizontal ranking bar chart)
- **Live Inference History Feed**: Displays the latest predictions logged into the SQLite database.

### 2. Student Management (Complete CRUD)
- **Full Lifecycle**: Create, Read, Update, and Delete student records.
- **Academic Fields**: Student ID, Name, Class/Grade, Section, Attendance %, Previous Exam Marks (0–100), Daily Study Hours (0–24), Assignment Completion % (0–100), and Actual Final Marks (optional).
- **Search & Multi-Filter**: Filter dynamically by Class, Section, and Performance Category, with debounced text search.
- **Student Profile Modal**: Quick inspection modal displaying student metrics and instantaneous AI model inference.

### 3. Individual Performance Predictor
- **Input Form**: Sliders and number inputs for Attendance %, Previous Marks, Daily Study Hours, and Assignment Completion %.
- **Instant ML Inference**: Executes the saved model pipeline and renders an attractive score gauge (0–100).
- **Performance Categories**:
  - **Excellent**: 85 – 100 marks
  - **Good**: 70 – 84 marks
  - **Average**: 50 – 69 marks
  - **At Risk**: Below 50 marks (*Triggers urgent academic intervention alerts*)
- **Directional Feature Impact**: Visualizes how each parameter positively or negatively swayed the predicted score relative to cohort benchmark averages.
- **Personalized Recommendations**: Context-aware recommendations across 5 categories (*Attendance, Study Habits, Exam Preparation, Assignments, Academic Excellence*).

### 4. Bulk CSV Upload & Batch Inference
- **Drag-and-Drop Dropzone** with file browsing.
- **Sample CSV Template Download**: One-click download of a pre-formatted `student_prediction_sample_template.csv`.
- **4-Stage Progress Pipeline**: *Select File &rarr; Schema Validation &rarr; Batch ML Inference &rarr; Results & Export*.
- **Validation**: Rejects non-CSV files, missing columns, or out-of-range values with detailed line-by-line feedback.
- **Batch Results Table & Distribution Chart**: Displays predictions for all uploaded rows and offers **CSV Export**.

### 5. Performance Analytics
- **Class-wise Comparison**: Sectional averages for attendance, previous marks, and predicted scores.
- **At-Risk Student Identification Roster**: Filterable roster dedicated strictly to students scoring &lt; 50 marks.
- **Student Performance Matrix**: Sortable cohort matrix for comparative analysis.

### 6. Model Insights & Telemetry
- **Model Tournament**: Side-by-side comparison between **Linear Regression** and **Random Forest Regressor** across 5-Fold Cross Validation $R^2$, Held-Out Test MAE, RMSE, and $R^2$.
- **Feature Importance**: Ranked relative importance percentages derived from model weights.
- **Zero Data Leakage Guarantee**: Enforces that final examination marks are never exposed to the model during training or prediction.
- **Live Parameter Sensitivity Simulator**: Real-time slider simulator showing score variations as parameters change.

### 7. Reports & Compliance Center
- **Institutional Audit Report CSV**: Complete data dump of student metrics and predicted outcomes.
- **At-Risk Intervention Roster CSV**: Tailored export for counseling departments and class teachers.
- **Printable Audit Sheet**: Browser print-friendly layout.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Recharts 2, Lucide React |
| **Backend** | Python 3.11+, FastAPI 0.110+, Pydantic v2, Uvicorn, Python-Multipart |
| **Machine Learning** | Scikit-learn 1.4+, Pandas 2.2+, NumPy 1.26+, Joblib |
| **Database** | SQLite, SQLAlchemy 2.0+ ORM |
| **Testing** | Pytest 8.0+, HTTPX |

---

## 4. Machine Learning Model Performance

Trained on a reproducible synthetic dataset of 1,200 student records with realistic statistical distributions and academic correlations:

| Model Architecture | 5-Fold CV $R^2$ Score | Held-Out Test MAE | Held-Out Test RMSE | Held-Out Test $R^2$ | Status |
|---|---|---|---|---|---|
| **Linear Regression (Pipeline)** | **0.8958 (±0.0093)** | **2.975 marks** | **3.745 marks** | **0.9032** | **Champion Model** |
| **Random Forest Regressor** | **0.8753 (±0.0159)** | **3.414 marks** | **4.227 marks** | **0.8767** | **Candidate Model** |

### Feature Importance Weights
- **Assignment Completion**: `51.61%`
- **Previous Examination Marks**: `36.92%`
- **Attendance Percentage**: `6.21%`
- **Daily Study Hours**: `5.26%`

*Continuous assessment metrics (assignments and previous examination results) account for over 88% of final score variance.*

---

## 5. Getting Started (Windows Setup Instructions)

### Prerequisites
- Windows 10 or 11
- Python 3.11+
- Node.js 18+ and npm

---

### Step 1: Open PowerShell in the Project Directory
```powershell
cd "c:\Users\Riyaz Mahammad\OneDrive\Desktop\student-performance-prediction-system"
```

---

### Step 2: Set Up Python Virtual Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install backend dependencies
pip install -r backend\requirements.txt
```

---

### Step 3: Generate Dataset, Train Model & Seed Database
```powershell
# 1. Generate the synthetic student dataset and sample upload CSV
.\.venv\Scripts\python.exe backend\scripts\generate_demo_data.py

# 2. Train and evaluate the ML regression models, saving the fitted pipeline
.\.venv\Scripts\python.exe backend\scripts\train_model.py

# 3. Seed the SQLite database with 80 demo students and prediction history
$env:PYTHONPATH = "backend"
.\.venv\Scripts\python.exe backend\scripts\seed_db.py
```

---

### Step 4: Install Frontend Dependencies & Build
```powershell
cd frontend
npm install
npm run build
cd ..
```

---

### Step 5: Run the Full-Stack Application

You have two convenient options:

#### Option A: Unified Production Server (Single Command)
FastAPI serves both the REST API and the compiled React production frontend on port 8000:
```powershell
$env:PYTHONPATH = "backend"
.\.venv\Scripts\uvicorn.exe app.main:app --port 8000 --reload
```
Open your browser and navigate to:
- **Application Dashboard:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)

#### Option B: Development Mode (Vite Hot-Reload)
Run FastAPI and Vite concurrently in two separate terminals:

**Terminal 1 (Backend):**
```powershell
$env:PYTHONPATH = "backend"
.\.venv\Scripts\uvicorn.exe app.main:app --port 8000 --reload
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
Open your browser at: [http://localhost:3000](http://localhost:3000)

---

## 6. Retraining the Machine Learning Model

To regenerate data and retrain the machine learning pipeline at any time:
```powershell
# Regenerate 1200+ synthetic student records
.\.venv\Scripts\python.exe backend\scripts\generate_demo_data.py

# Re-train models and overwrite models/student_model.joblib & models/model_metrics.json
.\.venv\Scripts\python.exe backend\scripts\train_model.py
```

---

## 7. Testing CSV Bulk Upload

1. Navigate to the **Upload CSV** tab in the web interface.
2. Click **Download Sample CSV Template** (or use the pre-generated `data/sample_students.csv`).
3. Drag and drop `sample_students.csv` into the dropzone.
4. Click **Run Bulk Predictions**.
5. View the resulting distribution chart and student prediction table.
6. Click **Download Report** to save the output as a CSV.

---

## 8. Automated Test Suite Execution

Run the comprehensive automated test suite (15 unit and integration tests):
```powershell
$env:PYTHONPATH = "backend"
.\.venv\Scripts\pytest.exe backend\tests -v
```

### Verified Test Results:
```
backend/tests/test_api.py::test_health_check_endpoint PASSED             [  6%]
backend/tests/test_api.py::test_dashboard_summary_endpoint PASSED        [ 13%]
backend/tests/test_api.py::test_student_crud_endpoints PASSED            [ 20%]
backend/tests/test_api.py::test_predict_performance_endpoint PASSED      [ 26%]
backend/tests/test_api.py::test_bulk_predict_endpoint PASSED             [ 33%]
backend/tests/test_api.py::test_model_metrics_endpoint PASSED            [ 40%]
backend/tests/test_api.py::test_report_export_endpoint PASSED            [ 46%]
backend/tests/test_api.py::test_sample_csv_download_endpoint PASSED      [ 53%]
backend/tests/test_ml.py::test_model_pipeline_loaded PASSED              [ 60%]
backend/tests/test_ml.py::test_predict_bounds PASSED                     [ 66%]
backend/tests/test_ml.py::test_performance_categorization PASSED         [ 73%]
backend/tests/test_ml.py::test_feature_contributions PASSED              [ 80%]
backend/tests/test_services.py::test_recommendation_low_attendance PASSED [ 86%]
backend/tests/test_services.py::test_recommendation_high_performer PASSED [ 93%]
backend/tests/test_services.py::test_recommendation_at_risk PASSED       [100%]

============================= 15 passed in 2.71s ==============================
```

---

## 9. Known Limitations & Roadmap

- **Demonstration Dataset**: Models are currently fitted on a controlled synthetic dataset designed for reproducible student evaluation. Future versions can connect to real institutional LMS (Canvas, Moodle, Blackboard) via OAuth2 connectors.
- **Feature Set**: The model currently focuses on four core academic predictors (`attendance`, `previous_marks`, `study_hours`, `assignment_completion`). Adding extracurricular involvement, sleep metrics, and socioeconomic factors would further enrich insights.
- **Deep Learning Comparison**: Future iterations can benchmark against Neural Network regression architectures (MLP, PyTorch).

---

## 10. Resume Bullet Points (B.Tech AI & Data Science)

Highlight this project on your resume with these impactful bullet points:

- **Full-Stack ML Web Application**: Architected and developed a production-ready Student Performance Prediction System using **FastAPI, React, Tailwind CSS, and SQLite**, predicting final examination scores and classifying student vulnerability with an **$R^2$ of 0.90** and an **MAE of 2.97 marks**.
- **Supervised ML Pipeline & Evaluation**: Engineered a scikit-learn regression pipeline comparing **Random Forest** and **Linear Regression** via **5-Fold Cross-Validation**; integrated Joblib model persistence, Gini feature importance analysis, and zero-data-leakage safeguards.
- **Interactive Analytics & Bulk Processing**: Implemented a responsive multi-page dashboard featuring **6 interactive Recharts visualizations**, CSV batch inference with schema validation, rule-based recommendation heuristics, and automated test coverage across 15 integration suites.
