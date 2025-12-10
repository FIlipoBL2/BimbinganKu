package com.RPL.BimbinganKu.service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.itextpdf.text.pdf.*;
import com.itextpdf.text.*;

@Service
public class PDFService {
    public byte[] generateStudentTablePdf(List<com.RPL.BimbinganKu.data.Student> students) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("Student Table", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new int[] { 3, 5, 5, 3, 3 });

        Stream.of("NPM", "Name", "Email", "UTS Guidance", "UAS Guidance")
                .forEach(headerTitle -> {
                    PdfPCell header = new PdfPCell();
                    header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                    header.setPhrase(new Phrase(headerTitle));
                    header.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(header);
                });

        for (com.RPL.BimbinganKu.data.Student s : students) {
            table.addCell(s.getNpm() != null ? s.getNpm() : "");
            table.addCell(s.getName() != null ? s.getName() : "");
            table.addCell(s.getEmail() != null ? s.getEmail() : "");
            table.addCell(countCell(s.getTotalGuidanceUTS()));
            table.addCell(countCell(s.getTotalGuidanceUAS()));
        }

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private PdfPCell countCell(int count) {
        PdfPCell cell = new PdfPCell(new Phrase(String.valueOf(count)));
        if (count < 3)
            cell.setBackgroundColor(new BaseColor(255, 200, 200));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }
}
