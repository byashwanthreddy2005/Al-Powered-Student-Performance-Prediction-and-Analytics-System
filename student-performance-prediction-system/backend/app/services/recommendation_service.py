"""
Recommendation Service.
Generates tailored, actionable academic improvement recommendations
based on attendance, previous marks, study hours, and assignment completion.
"""

from typing import List
from app.schemas.prediction import RecommendationItem


class RecommendationEngine:
    @staticmethod
    def generate_recommendations(
        attendance: float,
        previous_marks: float,
        study_hours: float,
        assignment_completion: float,
        predicted_marks: float
    ) -> List[RecommendationItem]:
        recommendations: List[RecommendationItem] = []

        # 1. Attendance evaluation
        if attendance < 65.0:
            recommendations.append(RecommendationItem(
                area="Attendance",
                priority="High",
                title="Critical Attendance Shortage",
                message=(
                    f"Current attendance is at {attendance:.1f}%, which is below the safe threshold of 75%. "
                    "Regular lecture presence is strongly correlated with concept retention. "
                    "Prioritize attending all scheduled lectures, lab sessions, and tutorial hours."
                )
            ))
        elif attendance < 75.0:
            recommendations.append(RecommendationItem(
                area="Attendance",
                priority="Medium",
                title="Improve Class Attendance",
                message=(
                    f"Attendance is at {attendance:.1f}%. Aim to increase this above 80% to ensure "
                    "you do not miss critical revision discussions and test announcements."
                )
            ))
        else:
            recommendations.append(RecommendationItem(
                area="Attendance",
                priority="Positive",
                title="Strong Attendance Discipline",
                message=f"Excellent attendance record of {attendance:.1f}%. Maintaining this consistent classroom engagement provides a solid foundation."
            ))

        # 2. Daily Study Hours evaluation
        if study_hours < 2.0:
            recommendations.append(RecommendationItem(
                area="Study Habits",
                priority="High",
                title="Increase Daily Self-Study",
                message=(
                    f"Current study time of {study_hours:.1f} hrs/day is insufficient for comprehensive topic coverage. "
                    "Implement a structured daily routine allocating at least 2.5 to 3.5 hours for active recall and problem-solving."
                )
            ))
        elif study_hours < 3.5:
            recommendations.append(RecommendationItem(
                area="Study Habits",
                priority="Medium",
                title="Optimize Study Consistency",
                message=(
                    f"Study duration of {study_hours:.1f} hrs/day is moderate. Utilize techniques like the Pomodoro method "
                    "and dedicate dedicated blocks to tougher subjects to raise retention."
                )
            ))
        else:
            recommendations.append(RecommendationItem(
                area="Study Habits",
                priority="Positive",
                title="Diligent Study Routine",
                message=f"Great commitment with {study_hours:.1f} hours of daily self-study. Ensure quality breaks and active practice rather than passive reading."
            ))

        # 3. Previous Examination Performance evaluation
        if previous_marks < 50.0:
            recommendations.append(RecommendationItem(
                area="Exam Preparation",
                priority="High",
                title="Address Foundational Gaps",
                message=(
                    f"Previous score of {previous_marks:.1f} indicates core conceptual difficulties. "
                    "Schedule one-on-one doubt clarification sessions with professors or peer mentors, "
                    "and review foundational chapters before tackling advanced topics."
                )
            ))
        elif previous_marks < 70.0:
            recommendations.append(RecommendationItem(
                area="Exam Preparation",
                priority="Medium",
                title="Timed Practice Tests & Past Papers",
                message=(
                    f"Previous exam score was {previous_marks:.1f}. Solve at least 3-5 previous years' exam papers "
                    "under timed conditions to improve speed, accuracy, and answer structuring."
                )
            ))
        else:
            recommendations.append(RecommendationItem(
                area="Exam Preparation",
                priority="Positive",
                title="Solid Academic Foundation",
                message=f"Commendable previous score of {previous_marks:.1f}. Focus on maintaining this high bar by summarizing high-weightage topics."
            ))

        # 4. Assignment Completion evaluation
        if assignment_completion < 60.0:
            recommendations.append(RecommendationItem(
                area="Assignments",
                priority="High",
                title="Clear Pending Assignments Immediately",
                message=(
                    f"Assignment completion rate of {assignment_completion:.1f}% is low. Homework assignments reinforce "
                    "examination-style questions and contribute to internal assessments. Submit all backlog tasks promptly."
                )
            ))
        elif assignment_completion < 80.0:
            recommendations.append(RecommendationItem(
                area="Assignments",
                priority="Medium",
                title="Boost Assignment Consistency",
                message=(
                    f"Completion rate is {assignment_completion:.1f}%. Aim to submit assignments ahead of deadlines "
                    "to receive early instructor feedback and clarify errors."
                )
            ))
        else:
            recommendations.append(RecommendationItem(
                area="Assignments",
                priority="Positive",
                title="Outstanding Assignment Submission",
                message=f"Outstanding assignment completion of {assignment_completion:.1f}%. This regular practice significantly strengthens exam readiness."
            ))

        # 5. Advanced / Holistic recommendation based on predicted score
        if predicted_marks >= 85.0:
            recommendations.append(RecommendationItem(
                area="Excellence",
                priority="Positive",
                title="Pursue Advanced Enrichment",
                message=(
                    f"Predicted score is {predicted_marks:.1f} (Excellent). Channel this academic momentum into competitive examinations, "
                    "research papers, peer tutoring, or advanced domain certifications."
                )
            ))
        elif predicted_marks < 50.0:
            recommendations.append(RecommendationItem(
                area="Intervention",
                priority="High",
                title="Academic Advisory Intervention Recommended",
                message=(
                    f"Predicted final score is {predicted_marks:.1f} (At Risk). Recommend meeting with the department academic counselor "
                    "for an individualized recovery roadmap and remedial class enrollment."
                )
            ))

        return recommendations

