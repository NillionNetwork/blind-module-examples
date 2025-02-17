import os
import sys

# Add the project root directory to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Run the Streamlit app
if __name__ == "__main__":
    os.system(f"streamlit run {os.path.join(project_root, 'app.py')}") 