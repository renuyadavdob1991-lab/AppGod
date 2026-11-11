package com.appgod.appgod;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class HomeController {

    @GetMapping("/api/status")
    public String status() {
        return "APP GOD SYSTEM ONLINE";
    }

    @PostMapping("/api/calculate")
    public Map<String, BigDecimal> calculate(
            @RequestBody CalculationRequest request) {

        BigDecimal a = request.a();
        BigDecimal b = request.b();

        BigDecimal result;

        switch (request.operation()) {

            case "add":
                result = a.add(b);
                break;

            case "subtract":
                result = a.subtract(b);
                break;

            case "multiply":
                result = a.multiply(b);
                break;

            case "divide":
                if (b.compareTo(BigDecimal.ZERO) == 0) {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cannot divide by zero"
                    );
                }

                result = a.divide(b, MathContext.DECIMAL128);
                break;

            case "percent":
                result = a.divide(BigDecimal.valueOf(100));
                break;

            default:
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid operation"
                );
        }

        return Map.of("result", result);
    }

    public record CalculationRequest(
            BigDecimal a,
            BigDecimal b,
            String operation) {
    }
}