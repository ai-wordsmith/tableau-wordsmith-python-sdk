FROM python:3.6
MAINTAINER Dan Salo "dsalo@automatedinsights.com"

COPY ./requirements.txt /requirements.txt
RUN pip install -r requirements.txt

ADD ./app /app
ADD ./static /static
ADD ./templates /templates
COPY ./main.py /main.py
COPY ./config.yml /config.yml

ENTRYPOINT ["python"]
CMD ["main.py"]

EXPOSE 5050
