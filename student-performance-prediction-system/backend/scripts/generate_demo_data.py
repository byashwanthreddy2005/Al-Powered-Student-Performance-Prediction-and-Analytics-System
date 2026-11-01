"""
Generates a realistic, reproducible synthetic student dataset for training
the Student Performance Prediction models and populating sample records.
"""

from pathlib import Path
import numpy as np
import pandas as pd

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATASET_CSV = DATA_DIR / "synthetic_student_dataset.csv"
SAMPLE_UPLOAD_CSV = DATA_DIR / "sample_students.csv"


FIRST_NAMES = [
    "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Sneha", "Aditya", "Neha",
    "Rahul", "Kavya", "Arjun", "Divya", "Siddharth", "Pooja", "Varun", "Isha",
    "Karan", "Tanvi", "Nikhil", "Ritu", "Sameer", "Meera", "Gaurav", "Swati",
    "Kunal", "Shreya", "Deepak", "Anjali", "Harish", "Shruti", "Ayush", "Bhavna",
    "Manish", "Tara", "Riyaz", "Sunita", "Rajesh", "Nandini", "Amit", "Komal"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Rao", "Gupta", "Nair", "Iyer",
    "Malhotra", "Kapoor", "Chopra", "Deshmukh", "Joshi", "Bhatia", "Mehta",
    "Saxena", "Choudhury", "Bose", "Menon", "Chatterjee", "Kulkarni", "Aggarwal",
    "Singh", "Mahammad", "Pillai", "Das", "Ghosh", "Mishra", "Pandey", "Yadav"
]

CLASSES = ["Grade 10", "Grade 11", "Grade 12", "AI & DS - Sem 3", "AI & DS - Sem 5"]
SECTIONS = ["A", "B", "C"]


def generate_dataset(num_records: int = 1200, random_seed: int = 42) -> pd.DataFrame:
    """Generate reproducible student records with realistic statistical correlations."""
    np.random.seed(random_seed)

    records = []
    for i in range(1, num_records + 1):
        student_id = f"STU-{1000 + i}"
        first_name = np.random.choice(FIRST_NAMES)
        last_name = np.random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        class_name = np.random.choice(CLASSES)
        section = np.random.choice(SECTIONS)

        # Baseline latent capability / motivation factor (standard normal)
        latent_factor = np.random.normal(0, 1)

        # Attendance %: correlated with latent factor, mean ~76%, std ~12
        attendance = 76.0 + (latent_factor * 8.0) + np.random.normal(0, 7)
        attendance = float(np.clip(round(attendance, 1), 35.0, 100.0))

        # Previous Marks: correlated with latent factor, mean ~68%, std ~14
        prev_marks = 68.0 + (latent_factor * 11.0) + np.random.normal(0, 6)
        prev_marks = float(np.clip(round(prev_marks, 1), 25.0, 99.0))

        # Study Hours per day: mean ~3.5h, ranges from 0.5 to 9.0h
        study_hours = 3.4 + (latent_factor * 1.1) + np.random.normal(0, 0.9)
        study_hours = float(np.clip(round(study_hours, 1), 0.5, 9.5))

        # Assignment completion %: correlated with study hours and attendance
        assignment = (0.5 * attendance) + (4.5 * study_hours) + np.random.normal(0, 5)
        assignment = float(np.clip(round(assignment, 1), 20.0, 100.0))

        # Final Examination Marks (target variable)
        # Domain formulation:
        # 38% weight on previous examination marks (strongest predictor)
        # 24% weight on attendance consistency
        # 20% weight on assignment completion
        # 18% weight on daily study hours (scaled up to 100%)
        # Plus realistic non-linear diminishing returns and random exam-day noise
        study_hours_scaled = np.minimum(study_hours * 11.5, 100.0)
        
        target = (
            0.38 * prev_marks +
            0.24 * attendance +
            0.20 * assignment +
            0.18 * study_hours_scaled +
            np.random.normal(0, 3.8)  # Exam day variance
        )
        final_marks = float(np.clip(round(target, 1), 18.0, 100.0))

        records.append({
            "student_id": student_id,
            "name": name,
            "class_name": class_name,
            "section": section,
            "attendance": attendance,
            "previous_marks": prev_marks,
            "study_hours": study_hours,
            "assignment_completion": assignment,
            "final_marks": final_marks
        })

    df = pd.DataFrame(records)
    return df


def generate_sample_upload_csv():
    """Generates a clean sample CSV for the upload and bulk prediction test."""
    sample_students = [
        {"student_id": "STU-2001", "student_name": "Aarav Sharma", "attendance": 88.5, "previous_marks": 84.0, "study_hours": 4.5, "assignment_completion": 92.0},
        {"student_id": "STU-2002", "student_name": "Priya Nair", "attendance": 94.0, "previous_marks": 91.5, "study_hours": 5.5, "assignment_completion": 98.0},
        {"student_id": "STU-2003", "student_name": "Rohan Patel", "attendance": 52.0, "previous_marks": 44.0, "study_hours": 1.2, "assignment_completion": 45.0},
        {"student_id": "STU-2004", "student_name": "Sneha Gupta", "attendance": 72.0, "previous_marks": 68.5, "study_hours": 3.0, "assignment_completion": 70.0},
        {"student_id": "STU-2005", "student_name": "Vikram Verma", "attendance": 41.5, "previous_marks": 38.0, "study_hours": 1.0, "assignment_completion": 30.0},
        {"student_id": "STU-2006", "student_name": "Ananya Rao", "attendance": 85.0, "previous_marks": 79.0, "study_hours": 4.0, "assignment_completion": 88.0},
        {"student_id": "STU-2007", "student_name": "Aditya Singh", "attendance": 96.0, "previous_marks": 95.0, "study_hours": 6.0, "assignment_completion": 99.0},
        {"student_id": "STU-2008", "student_name": "Kavya Iyer", "attendance": 64.0, "previous_marks": 58.0, "study_hours": 2.2, "assignment_completion": 60.0},
        {"student_id": "STU-2009", "student_name": "Kunal Deshmukh", "attendance": 48.0, "previous_marks": 42.0, "study_hours": 1.5, "assignment_completion": 40.0},
        {"student_id": "STU-2010", "student_name": "Meera Joshi", "attendance": 90.0, "previous_marks": 86.0, "study_hours": 4.8, "assignment_completion": 94.0},
        {"student_id": "STU-2011", "student_name": "Rahul Bhatia", "attendance": 78.5, "previous_marks": 72.0, "study_hours": 3.5, "assignment_completion": 80.0},
        {"student_id": "STU-2012", "student_name": "Divya Malhotra", "attendance": 55.0, "previous_marks": 49.0, "study_hours": 1.8, "assignment_completion": 52.0},
    ]
    df = pd.DataFrame(sample_students)
    df.to_csv(SAMPLE_UPLOAD_CSV, index=False)
    print(f"Sample upload CSV created at: {SAMPLE_UPLOAD_CSV}")


def main():
    print("Generating synthetic student performance dataset...")
    df = generate_dataset(num_records=1200, random_seed=42)
    df.to_csv(DATASET_CSV, index=False)
    print(f"Generated {len(df)} records at: {DATASET_CSV}")
    print("\nDataset Summary Statistics:")
    print(df[["attendance", "previous_marks", "study_hours", "assignment_completion", "final_marks"]].describe())

    generate_sample_upload_csv()
    print("Dataset generation complete!")


if __name__ == "__main__":
    main()

