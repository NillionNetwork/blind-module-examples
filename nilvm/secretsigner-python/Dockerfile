FROM python:3.12-slim

WORKDIR /app

# Install BeautifulSoup4
RUN pip install beautifulsoup4

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the meta tags script
COPY add_meta_tags.py .

# Run the script to add meta tags
RUN python add_meta_tags.py

# Copy the rest of the app
COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]