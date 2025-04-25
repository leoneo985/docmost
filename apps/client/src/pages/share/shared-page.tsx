import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSharePageQuery } from "@/features/share/queries/share-query.ts";
import { Container, Button, Group, Loader } from "@mantine/core";
import React, { useEffect, useCallback, useState, useRef } from "react";
import ReadonlyPageEditor from "@/features/editor/readonly-page-editor.tsx";
import { extractPageSlugId } from "@/lib";
import { Error404 } from "@/components/ui/error-404.tsx";
import { IconFileTypePdf } from "@tabler/icons-react";
import html2pdf from 'html2pdf.js';

export default function SingleSharedPage() {
  const { t } = useTranslation();
  const { pageSlug } = useParams();
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useSharePageQuery({
    pageId: extractPageSlugId(pageSlug),
  });

  useEffect(() => {
    if (shareId && data?.share?.key && pageSlug && navigate) {
      if (data.share.key !== shareId) {
        console.log(`Redirecting: shareId mismatch. Current: ${shareId}, Expected: ${data.share.key}`);
        navigate(`/share/${data.share.key}/p/${pageSlug}`, { replace: true });
      }
    }
  }, [shareId, data, navigate, pageSlug]);

  const handleDownloadPdf = useCallback(async () => {
    if (!data || !data.page || !data.page.id || !contentRef.current) {
      console.error("Cannot download PDF: Content element ref or page data/id is missing.", {
        hasContentRef: !!contentRef.current,
        hasData: !!data,
        hasPage: !!data?.page,
        hasPageId: !!data?.page?.id
      });
      alert(t("Failed to initiate PDF download. Content or page info missing."));
      return;
    }

    setIsDownloading(true);

    const element = contentRef.current;
    const pageTitle = data.page.title || t("untitled");
    const filename = `${pageTitle}.pdf`;

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("html2pdf error:", err);
      alert(t("Failed to generate PDF."));
    } finally {
      setIsDownloading(false);
    }

  }, [data?.page, t]);

  if (isLoading) {
    return <Container size="md" style={{ textAlign: 'center', paddingTop: '50px' }}><Loader /></Container>;
  }

  if (isError || !data) {
    if ([401, 403, 404].includes(error?.["status"])) {
      return <Error404 />;
    }
    return <div>{t("Error fetching page data.")}</div>;
  }

  return (
    <div>
      <Helmet>
        <title>{`${data?.page?.title || t("untitled")}`}</title>
        {!data?.share.searchIndexing && (
          <meta name="robots" content="noindex" />
        )}
      </Helmet>

      <Container size={900} mb="md">
         <Group justify="flex-end">
            <Button 
              leftSection={isDownloading ? <Loader size={16} /> : <IconFileTypePdf size={16} />}
              variant="light"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? t("Generating PDF...") : t("Download as PDF")}
            </Button>
          </Group>
      </Container>

      <Container id="share-content-area" size={900} p={0} ref={contentRef}>
        <ReadonlyPageEditor
          key={data.page.id}
          title={data.page.title}
          content={data.page.content}
        />
      </Container>
    </div>
  );
}
