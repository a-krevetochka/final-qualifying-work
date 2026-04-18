package ru.vkr.stockanalyzer.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import ru.vkr.stockanalyzer.dto.stock.ChartDto;
import ru.vkr.stockanalyzer.dto.stock.StockDto;
import ru.vkr.stockanalyzer.dto.stock.StockPriceDto;
import ru.vkr.stockanalyzer.dto.stock.StockSearchDto;
import ru.vkr.stockanalyzer.exception.StockNotFoundException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MoexClient {

    private final RestTemplate restTemplate;

    @Value("${moex.api.url}")
    private String moexUrl;

    public List<StockSearchDto> search(String query) {
        String url = moexUrl + "/securities.json?q=" + query +
                "&group_by=group&group_by_filter=stock_shares&limit=20";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        List<StockSearchDto> result = new ArrayList<>();

        if (response == null) return result;

        Map<String, Object> securities = (Map<String, Object>) response.get("securities");
        List<String> columns           = (List<String>) securities.get("columns");
        List<List<Object>> data        = (List<List<Object>>) securities.get("data");

        int secidIdx    = columns.indexOf("secid");
        int nameIdx     = columns.indexOf("name");
        int groupIdx    = columns.indexOf("group");

        for (List<Object> row : data) {
            String group = (String) row.get(groupIdx);
            if (!"stock_shares".equals(group)) continue;

            result.add(StockSearchDto.builder()
                    .ticker((String) row.get(secidIdx))
                    .name((String) row.get(nameIdx))
                    .build());
        }

        return result;
    }

    public StockDto getStock(String ticker) {
        String url = moexUrl + "/engines/stock/markets/shares/boards/TQBR/securities/" +
                ticker + ".json";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null) throw new StockNotFoundException("Акция не найдена: " + ticker);

        Map<String, Object> securities = (Map<String, Object>) response.get("securities");
        List<String> secColumns        = (List<String>) securities.get("columns");
        List<List<Object>> secData     = (List<List<Object>>) securities.get("data");

        Map<String, Object> marketdata = (Map<String, Object>) response.get("marketdata");
        List<String> mdColumns         = (List<String>) marketdata.get("columns");
        List<List<Object>> mdData      = (List<List<Object>>) marketdata.get("data");

        if (secData.isEmpty()) throw new StockNotFoundException("Акция не найдена: " + ticker);

        List<Object> sec = secData.get(0);
        List<Object> md  = mdData.isEmpty() ? null : mdData.get(0);

        int nameIdx     = secColumns.indexOf("SECNAME");
        int sectorIdx   = secColumns.indexOf("SECTORID");
        int lastIdx     = md != null ? mdColumns.indexOf("LAST") : -1;
        int changeIdx   = md != null ? mdColumns.indexOf("LASTTOPREVPRICE") : -1;
        int capIdx      = md != null ? mdColumns.indexOf("ISSUECAPITALIZATION") : -1;

        Double price  = md != null && lastIdx >= 0 ? toDouble(md.get(lastIdx)) : null;
        Double change = md != null && changeIdx >= 0 ? toDouble(md.get(changeIdx)) : null;
        Double cap    = md != null && capIdx >= 0 ? toDouble(md.get(capIdx)) : null;

        return StockDto.builder()
                .ticker(ticker)
                .name((String) sec.get(nameIdx))
                .sector((String) sec.get(sectorIdx))
                .price(price)
                .priceChange(change)
                .marketCap(cap)
                .build();
    }

    public String getCompanyName(String ticker) {
        try {
            return getStock(ticker).getName();
        } catch (Exception e) {
            return ticker;
        }
    }

    public List<ChartDto> getCandles(String ticker, int days) {
        String dateFrom = LocalDate.now().minusDays(days)
                .format(DateTimeFormatter.ISO_LOCAL_DATE);
        String dateTo   = LocalDate.now()
                .format(DateTimeFormatter.ISO_LOCAL_DATE);

        String url = moexUrl + "/engines/stock/markets/shares/boards/TQBR/securities/" +
                ticker + "/candles.json?from=" + dateFrom + "&till=" + dateTo + "&interval=24";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        List<ChartDto> result = new ArrayList<>();

        if (response == null) return result;

        Map<String, Object> candles = (Map<String, Object>) response.get("candles");
        List<String> columns        = (List<String>) candles.get("columns");
        List<List<Object>> data     = (List<List<Object>>) candles.get("data");

        int openIdx   = columns.indexOf("open");
        int closeIdx  = columns.indexOf("close");
        int highIdx   = columns.indexOf("high");
        int lowIdx    = columns.indexOf("low");
        int volumeIdx = columns.indexOf("volume");
        int beginIdx  = columns.indexOf("begin");

        for (List<Object> row : data) {
            result.add(ChartDto.builder()
                    .date((String) row.get(beginIdx))
                    .open(toDouble(row.get(openIdx)))
                    .close(toDouble(row.get(closeIdx)))
                    .high(toDouble(row.get(highIdx)))
                    .low(toDouble(row.get(lowIdx)))
                    .volume(toLong(row.get(volumeIdx)))
                    .build());
        }

        return result;
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Double d) return d;
        if (val instanceof Integer i) return i.doubleValue();
        if (val instanceof Long l) return l.doubleValue();
        if (val instanceof String s) {
            try { return Double.parseDouble(s); } catch (Exception e) { return null; }
        }
        return null;
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Long l) return l;
        if (val instanceof Integer i) return i.longValue();
        if (val instanceof Double d) return d.longValue();
        return null;
    }

    public StockPriceDto getPrice(String ticker) {
        String url = moexUrl + "/engines/stock/markets/shares/boards/TQBR/securities/" +
                ticker + ".json";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null) throw new StockNotFoundException("Акция не найдена: " + ticker);

        Map<String, Object> marketdata = (Map<String, Object>) response.get("marketdata");
        List<String> columns           = (List<String>) marketdata.get("columns");
        List<List<Object>> data        = (List<List<Object>>) marketdata.get("data");

        if (data.isEmpty()) throw new StockNotFoundException("Нет рыночных данных для: " + ticker);

        List<Object> md = data.get(0);

        return StockPriceDto.builder()
                .ticker(ticker)
                .price(toDouble(md.get(columns.indexOf("LAST"))))
                .change(toDouble(md.get(columns.indexOf("LASTTOPREVPRICE"))))
                .changePct(toDouble(md.get(columns.indexOf("LASTCHANGEPRCNT"))))
                .volume(toLong(md.get(columns.indexOf("VOLTODAY"))))
                .updatedAt(java.time.LocalDateTime.now().toString())
                .build();
    }
}