package com.project4.DailyTask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DailyTaskApplication {

	public static void main(String[] args) {
		SpringApplication.run(DailyTaskApplication.class, args);
	}

}
