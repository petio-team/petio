build:
	docker build -t petio .
	cd api && docker build -t petio-api .

run:
	docker-compose up -d

start:
	docker build -t petio .
	cd api && docker build -t petio-api .
	docker-compose up -d

stop:
	docker-compose down