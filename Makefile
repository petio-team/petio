build:
	docker build -t petio .

run:
	docker-compose up -d

start:
	docker build -t petio .
	docker-compose up -d

stop:
	docker-compose down